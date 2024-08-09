import { createModule } from 'graphql-modules';
import { typeDefs } from './typedefs.js';
import { resolvers } from './resolvers.js';

const Utilities = createModule({
  id: 'utilities',
  dirname: 'utilities',
  typeDefs,
  resolvers
});

export default Utilities;