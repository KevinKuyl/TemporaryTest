import { createModule, gql } from 'graphql-modules';
import Composer from '../../utils/Composer.js';
import Model from './models/sonar.js';

const typeDefs = Composer.GQLFromModel(Model, {
  // exclude: ['user'],
  // queries: ['mySonar: [Sonar]!'],
  // mutations: ['upsertFullSonar(sonar: [UpdateSonarInput]): [Sonar]!'],
  // subscriptions: ['sonarAdded: Sonar'],
  log: false
});

const resolvers = Composer.resolversFromModel(Model, {
  // queries: { mySonar: 'getFullSonar' },
  // mutations: { upsertFullSonar: 'upsertFullSonar' },
  //subscriptions: { 
    //public: {sonarAdded: 'sonarAdded'},
    //private: {sonarAdded: 'sonarAdded'} // not implemented yet
  // },
  log: false
});

export default createModule({
  id: 'sonar',
  dirname: 'Sonar',
  typeDefs,
  resolvers
});
