import { createModule, gql } from 'graphql-modules';
import Composer from '../../utils/Composer.js';
import Model from './models/sensor.js';

const typeDefs = Composer.GQLFromModel(Model, {
  // exclude: ['user'],
  // queries: ['mySensor: [Sensor]!'],
  // mutations: ['upsertFullSensor(sensor: [UpdateSensorInput]): [Sensor]!'],
  // subscriptions: ['sensorAdded: Sensor'],
  log: false
});

const resolvers = Composer.resolversFromModel(Model, {
  // queries: { mySensor: 'getFullSensor' },
  // mutations: { upsertFullSensor: 'upsertFullSensor' },
  //subscriptions: { 
    //public: {sensorAdded: 'sensorAdded'},
    //private: {sensorAdded: 'sensorAdded'} // not implemented yet
  // },
  log: false
});

export default createModule({
  id: 'sensor',
  dirname: 'Sensor',
  typeDefs,
  resolvers
});
