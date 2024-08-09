import { createModule, gql } from 'graphql-modules';
import Composer from '../../utils/Composer.js';
import Model from './models/message.js';

const typeDefs = Composer.GQLFromModel(Model, {
  // types: ['Message {}'],
  // exclude: ['user'],
  // include: ['randomVeld: String', 'randomVeld2: String'],
  // queries: ['myMessage: [Message]!'],
  // mutations: ['upsertFullMessage(message: [UpdateMessageInput]): [Message]!'],
  // subscriptions: ['messageAdded: Message'],
  log: true
});

const resolvers = Composer.resolversFromModel(Model, {
  // queries: { myMessage: 'getFullMessage' },
  // mutations: { upsertFullMessage: 'upsertFullMessage' },
  //subscriptions: { 
    //public: {messageAdded: 'messageAdded'},
    //private: {messageAdded: 'messageAdded'} // not implemented yet
  // },
  log: true
});

export default createModule({
  id: 'message',
  dirname: 'Message',
  typeDefs,
  resolvers
});
