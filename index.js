const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const express = require('express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { makeExecutableSchema } = require('@graphql-tools/schema');
//const { WebSocketServer } = require('ws');
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { useServer } = require('graphql-ws/lib/use/ws');
const mongoose = require('mongoose');
const { execute, subscribe } = require("graphql");

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { MONGODB } = require('./config.js');

const PORT = process.env.PORT || 5000;

(async function(){
    const schema = makeExecutableSchema({typeDefs, resolvers});

    const app = express();
    const httpServer = createServer(app);

    const subscriptionServer = SubscriptionServer.create(
        { schema, execute, subscribe },
        { server: httpServer, path: '/graphql' }
    );

    const server = new ApolloServer({
        schema,
        plugins: [
            {
                async serverWillStart(){
                    return {
                        async drainServer(){
                            subscriptionServer.close();
                        }
                    }
                }
            }
        ],
        context: ({ req }) => ({ req })
    });

    await server.start();
    server.applyMiddleware({ app });

    mongoose.connect(MONGODB, { useNewUrlParser: true })
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch(err => {
        console.error(err);
    });

    httpServer.listen(PORT, () => {
        //console.log(`Server running at ${res.url}`);
        console.log(`Http server is now running on http://localhost:${PORT}${server.graphqlPath}`);
    })

})();