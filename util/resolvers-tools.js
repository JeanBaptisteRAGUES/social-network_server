module.exports.makeConversationsLight = (conversations) => {
    return conversations.map(conv => (
        {
            id: conv.id,
            user1: conv.user1,
            user2: conv.user2,
            lastMessageDate: conv.lastMessageDate,
            messages: [conv.messages[0]]
        }
    ));
};