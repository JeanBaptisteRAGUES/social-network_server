const { AuthenticationError } = require('apollo-server');
const { PubSub } = require("graphql-subscriptions");

const Conversation = require('../../models/Conversation');
const checkAuth = require('../../util/check-auth');
const { makeConversationsLight } = require('../../util/resolvers-tools');

const pubsub = new PubSub();

module.exports = {
    Query: {
        async getConversations(_, { username, light }, context){
            const user = checkAuth(context);
            try{
                let conversations = await Conversation.find().sort({ lastMessageDate: -1 });
                conversations = conversations.filter(c => c.user1 === username || c.user2 === username);
                if(light) conversations = makeConversationsLight(conversations);
                return conversations;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getConversation(_, { conversationId }){
            try{
                const conversation = await Conversation.findById(conversationId);
                if(conversation){
                    return conversation;
                }else{
                    throw new Error('Conversation not found');
                }
            } catch (err) {
                throw new Error('Erreur récupération de la conversation : ' + err);
            }
        },
        async getConversationBetween(_, { username1, username2}){
            try{
                const conversations = await Conversation.find();
                const conversationBetween = conversations.find(conv => ( (conv.user1 === username1 || conv.user1 === username2) && (conv.user2 === username1 || conv.user2 === username2)));
                return conversationBetween;
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createConversation(_, { directMessageInput: {content, from, to} }, context){
            const user = checkAuth(context);
            
            if(content.trim() === ''){
                throw new Error('Direct message content must not be empty');
            }

            const newConversation = new Conversation({
                user1: from,
                user2: to,
                lastMessageDate: new Date().toISOString(),
                messages: [{
                    content,
                    from,
                    to,
                    createdAt: new Date().toISOString(),
                    seen: false
                }]
            });

            const conversation = await newConversation.save();

            pubsub.publish('CONVERSATION_CREATED', {
                conversationCreated: {
                    id: conversation.id,
                    user1: from,
                    user2: to,
                    lastMessageDate: new Date().toISOString(),
                    messages: [{
                        content,
                        from,
                        to,
                        createdAt: new Date().toISOString(),
                        seen: false
                    }]
                }
            });

            return conversation;
        },
        async deleteConversation(_, { conversationId }, context){
            const user = checkAuth(context);

            try {
                const conversation = await Conversation.findById(conversationId);
                if(user.username === conversation.user1 || user.username === conversation.user2) {
                    await conversation.delete();
                    return 'Conversation deleted sucessfully';
                }else{
                    throw new AuthenticationError('Action not allowed');
                }
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Subscription: {
        conversationCreated: {
            subscribe: () => pubsub.asyncIterator('CONVERSATION_CREATED')
        }
    }
}