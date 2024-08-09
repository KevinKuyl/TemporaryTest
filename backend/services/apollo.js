
import { ApolloServer } from '@apollo/server';
export const setupApolloServer = (parameters) => {
  return new ApolloServer(parameters);
};
