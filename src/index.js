import { GraphQLServer } from 'graphql-yoga';
import gql from 'graphql-tag';
import uuid4 from 'uuid/v4';

import { users, posts, comments } from './data';

// Type definitions (schema)
const typeDefs = gql`
  type Query {
    me: User!
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments: [Comment!]
    post: Post!
  }

  type Mutation {
    createUser(name: String!, email: String!, age: Int): User!
    createPost(
      title: String!
      body: String!
      published: Boolean!
      author: ID!
    ): Post!
    createComment(text: String!, post: ID!, author: ID!): Comment!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    post: Post!
    author: User!
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
    posts: (parent, args, ctx, info) => {
      const query = args.query && args.query.toLowerCase();
      if (!query) {
        return posts;
      }
      return posts.filter(
        post =>
          post.title.toLowerCase().includes(query) ||
          post.body.toLowerCase().includes(query),
      );
    },
    comments: (parent, args, ctx, info) => {
      return comments;
    },
    post: () => ({
      id: '456def',
      title: 'GraphQL Intro',
      body: '',
      published: false,
    }),
  },
  Mutation: {
    createUser: (parent, args, ctx, info) => {
      const exists = users.some(user => user.email === args.email);
      if (exists) {
        throw Error('Email already exists.');
      }
      const user = { id: uuid4(), ...args };
      users.push(user);
      return user;
    },
    createPost: (parent, args, ctx, info) => {
      const userExists = users.some(user => user.id === args.author);
      if (!userExists) {
        throw Error('User does not exist.');
      }
      const post = { id: uuid4(), ...args };
      posts.push(post);
      return post;
    },
    createComment: (parent, args, ctx, info) => {
      const userExists = users.some(user => user.id === args.author);
      const postExists = posts.some(p => p.id === args.post && p.published);
      if (!userExists) {
        throw Error('User does not exist.');
      }
      if (!postExists) {
        throw Error('Post does not exist.');
      }

      const comment = { id: uuid4(), ...args };
      comments.push(comment);
      return comment;
    },
  },
  User: {
    posts: (parent, args, ctx, info) => {
      return posts.filter(post => post.author === parent.id);
    },
    comments: (parent, args, ctx, info) => {
      return comments.filter(comment => comment.author === parent.id);
    },
  },
  Post: {
    author: (parent, args, ctx, info) => {
      return users.find(user => user.id === parent.author);
    },
    comments: (parent, args, ctx, info) => {
      return comments.filter(comment => comment.post === parent.id);
    },
  },
  Comment: {
    post: (parent, args, ctx, info) => {
      return posts.find(post => post.id === parent.post);
    },
    author: (parent, args, ctx, info) => {
      return users.find(user => user.id === parent.author);
    },
  },
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
});

server.start(({ port }) => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
