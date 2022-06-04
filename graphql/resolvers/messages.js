const Message = require('../../models/Message');
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

module.exports = {
    Query: {
        message: (_, { ID }) => Message.findById(ID)
    },
    Mutation: {
        async createMessage(_, { messageInput: {text, username} }) {

            if(text === null || text === undefined) throw new Error("Erreur: contenu du message non défini");

            const newMessage = new Message({
                text: text,
                createdBy: username
            });

            const res = await newMessage.save();

            if(res === null || res === undefined) throw new Error("Erreur enregistrement du message");
            
            pubsub.publish('MESSAGE_CREATED', {
                messageCreated: {
                    text: text,
                    createdBy: username
                }
            });

            return {
                id: res.id,
                ...res._doc
            };
        }
    },
    Subscription: {
        messageCreated: {
            subscribe: () => pubsub.asyncIterator('MESSAGE_CREATED')
        }
    }
}