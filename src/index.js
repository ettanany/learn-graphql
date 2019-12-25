import { GraphQLServer } from 'graphql-yoga';
import gql from 'graphql-tag';

// Type definitions (schema)
const typeDefs = gql`
  type Query {
    me: User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }
`;

// Resolvers
const resolvers = {
  Query: {
    me: () => ({
      id: '123abc',
      name: 'John',
      email: 'john@example.com',
      age: 26,
    }),
  },
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
});

server.start(({ port }) => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
