const { model, Schema } = require('mongoose');

const conversationSchema = new Schema({
    user1: String,
    user2: String,
    lastMessageDate: String,
    messages: [
        {
            content: String,
            from: String,
            to: String,
            createdAt: String,
            seen: Boolean
        }
    ]
});

module.exports = model('Conversation', conversationSchema);