import { GraphQLServer } from 'graphql-yoga';
import gql from 'graphql-tag';

import { users } from './data';

// Type definitions (schema)
const typeDefs = gql`
  type Query {
    me: User!
    users(query: String): [User!]!
    post: Post!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
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
    users: (parent, args, ctx, info) => {
      if (!args.query) {
        return users;
      }
      return users.filter(user =>
        user.name.toLowerCase().includes(args.query.toLowerCase()),
      );
    },
    post: () => ({
      id: '456def',
      title: 'GraphQL Intro',
      body: '',
      published: false,
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
