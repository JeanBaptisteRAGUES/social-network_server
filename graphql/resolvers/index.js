const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');
const messagesResolvers = require('./messages');
const conversationsResolvers = require('./conversations');
const directMessagesResolvers = require('./directMessages');

module.exports = {
    Post: {
        likeCount(parent){
            return parent.likes.length;
        },
        commentCount: (parent) => parent.comments.length
    },
    Query: {
        ...usersResolvers.Query,
        ...postsResolvers.Query,
        ...messagesResolvers.Query,
        ...conversationsResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation,
        ...messagesResolvers.Mutation,
        ...conversationsResolvers.Mutation,
        ...directMessagesResolvers.Mutation
    },
    Subscription: {
        ...messagesResolvers.Subscription,
        ...conversationsResolvers.Subscription,
        ...directMessagesResolvers.Subscription
    }
}