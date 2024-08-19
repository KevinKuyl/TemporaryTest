import { createModule, gql } from 'graphql-modules';
import Composer from '../../utils/Composer.js';
import Model from './models/device.js';

const typeDefs = Composer.GQLFromModel(Model, {
  // exclude: ['user'],
  // queries: ['myDevice: [Device]!'],
  // mutations: ['upsertFullDevice(device: [UpdateDeviceInput]): [Device]!'],
  // subscriptions: ['deviceAdded: Device'],
  log: false
});

const resolvers = Composer.resolversFromModel(Model, {
  // queries: { myDevice: 'getFullDevice' },
  // mutations: { upsertFullDevice: 'upsertFullDevice' },
  //subscriptions: { 
    //public: {deviceAdded: 'deviceAdded'},
    //private: {deviceAdded: 'deviceAdded'} // not implemented yet
  // },
  log: false
});

export default createModule({
  id: 'device',
  dirname: 'Device',
  typeDefs,
  resolvers
});
