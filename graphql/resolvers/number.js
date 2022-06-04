const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

module.exports = {
    Query: {
        currentNumber() {
            return this.currentNumber;
        },
    },
    Subscription: {
        numberIncremented: {
            //subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
            subscribe: () => pubsub.asyncIterator("NUMBER_INCREMENTED"),
        },
    },
}