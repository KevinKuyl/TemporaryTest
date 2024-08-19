import { createModule, gql } from 'graphql-modules';
import Composer from '../../utils/Composer.js';
import Model from './models/automation.js';

const typeDefs = Composer.GQLFromModel(Model, {
  // exclude: ['user'],
  // queries: ['myAutomation: [Automation]!'],
  // mutations: ['upsertFullAutomation(automation: [UpdateAutomationInput]): [Automation]!'],
  // subscriptions: ['automationAdded: Automation'],
  log: false
});

const resolvers = Composer.resolversFromModel(Model, {
  // queries: { myAutomation: 'getFullAutomation' },
  // mutations: { upsertFullAutomation: 'upsertFullAutomation' },
  //subscriptions: { 
    //public: {automationAdded: 'automationAdded'},
    //private: {automationAdded: 'automationAdded'} // not implemented yet
  // },
  log: false
});

export default createModule({
  id: 'automation',
  dirname: 'Automation',
  typeDefs,
  resolvers
});
