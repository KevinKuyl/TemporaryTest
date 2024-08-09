import {gql} from 'graphql-tag';

export const typeDefs = gql`
input sortInput {
  random: Boolean
  field: String
  order: Int
}
`;
