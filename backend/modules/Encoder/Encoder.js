import { createModule, gql } from 'graphql-modules';
import Composer from '../../utils/Composer.js';
import Model from './models/encoder.js';

const typeDefs = Composer.GQLFromModel(Model, {
  // exclude: ['user'],
  // queries: ['myEncoder: [Encoder]!'],
  // mutations: ['upsertFullEncoder(encoder: [UpdateEncoderInput]): [Encoder]!'],
  // subscriptions: ['encoderAdded: Encoder'],
  log: false
});

const resolvers = Composer.resolversFromModel(Model, {
  // queries: { myEncoder: 'getFullEncoder' },
  // mutations: { upsertFullEncoder: 'upsertFullEncoder' },
  //subscriptions: { 
    //public: {encoderAdded: 'encoderAdded'},
    //private: {encoderAdded: 'encoderAdded'} // not implemented yet
  // },
  log: false
});

export default createModule({
  id: 'encoder',
  dirname: 'Encoder',
  typeDefs,
  resolvers
});
