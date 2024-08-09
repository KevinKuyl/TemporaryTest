import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongooseClient from './database/mongooseClient.js';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import { application } from './application.js';
import { config } from './services/config.js';
import { permissions } from './services/permissions.js';
import { setupApolloServer } from './services/apollo.js';
import { getUser } from './services/tokens/resolve.js';
import { expressMiddleware } from '@apollo/server/express4';
import { applyMiddleware } from 'graphql-middleware';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import 'winston-mongodb';

const limiter = rateLimit({
  windowMs: 60 * 1000 * 60, // 1 hour
  max: 1000, // Max number of requests from a single IP within the windowMs
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.MongoDB({
      level: 'info',
      db: `${config.database.protocol}://${config.database.user}:${config.database.pass}@${config.database.host}/${config.database.name}`,
      collection: 'logs',
      capped: true,
      cappedMax: 1000,
      options: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        //dbName: config.database.name,
        sslValidate: false
      },
    }),
  ],
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true, limit: '5mb' }));
app.use(cors());
app.use(limiter);

app.use((req, res, next) => {
  logger.info({ method: req.method, origin: req.headers.origin, ip: req.ip });
  next();
});

app.use('/graphql', (req, res, next) => {
  const { query, variables, operationName } = req.body;
  logger.info({ query, variables, operationName });
  next();
});

function getUserFromToken(token) {
  if (token.startsWith('Bearer ')) {
    const tokenString = token.slice(7, token.length);
    const user = getUser(tokenString);

    return user;
  }
}

async function startServer() {
  await mongooseClient.connect();

  const schema = application.createSchemaForApollo();
  const server = setupApolloServer({
    schema: applyMiddleware(schema, permissions),
    introspection: config.dev
  });
  await server.start();

  app.use(expressMiddleware(server, {
    context: async ({ req }) => {
      let origin = req.headers.origin;
      const apiKey = req.headers['x-api-key'];
      const token = req.headers.authorization || '';
      const user = getUserFromToken(token);
      let filter;
      return { origin, user, apiKey, filter };
    }
  }));

  const httpServer = http.createServer(app);
  await httpServer.listen(4000);
  console.log('🚀 GraphQL Server ------ ready at http://localhost:4000/graphql');

  const subscriptionServer = SubscriptionServer.create(
    {
      schema: applyMiddleware(schema, permissions),
      execute,
      subscribe,
      onConnect: (connectionParams, webSocket, context) => {
        const user = getUserFromToken(connectionParams.Authorization || '');
        return { user };
      }
    },
    {
      server: httpServer,
      path: '/graphql',
    }
  );
  console.log('👾 Subscription Server - ready at ws://localhost:4000/graphql');
}

startServer();
