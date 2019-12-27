import { GraphQLServer } from 'graphql-yoga';
import gql from 'graphql-tag';
import uuid4 from 'uuid/v4';

let users = [
  {
    id: '1',
    name: 'John',
    email: 'john@example.com',
    age: 26,
  },
  {
    id: '2',
    name: 'Jane',
    email: 'jane@example.com',
    age: 22,
  },
  {
    id: '3',
    name: 'Johnny',
    email: 'johnny@example.com',
  },
  {
    id: '4',
    name: 'Jannie',
    email: 'jannie@example.com',
    age: 14,
  },
];

let posts = [
  {
    id: '100',
    title: 'Intro to GraphQL',
    body: 'This is a GraphQL intro post...',
    published: true,
    author: '1',
  },
  {
    id: '101',
    title: 'Advanced GraphQL',
    body: 'This is a post about advanced GraphQL...',
    published: false,
    author: '1',
  },
  {
    id: '102',
    title: 'Using GraphQL with React',
    body: 'This is a post about using GraphQL with React...',
    published: true,
    author: '2',
  },
];

let comments = [
  {
    id: '1001',
    text: 'Great intro to GraphQL!',
    author: '3',
    post: '100',
  },
  {
    id: '1002',
    text: 'Thanks for this amazing post!',
    author: '4',
    post: '100',
  },
  {
    id: '1003',
    text: 'Great explanation of using GraphQL with React.',
    author: '1',
    post: '102',
  },
  {
    id: '1004',
    text: 'Great explanation of using GraphQL with React.',
    author: '2',
    post: '102',
  },
];

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
    createUser(data: CreateUserInput!): User!
    deleteUser(id: ID!): User!
    createPost(data: CreatePostInput!): Post!
    deletePost(id: ID!): Post!
    createComment(data: CreateCommentInput!): Comment!
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

  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }

  input CreatePostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID!
  }

  input CreateCommentInput {
    text: String!
    post: ID!
    author: ID!
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
      const exists = users.some(user => user.email === args.data.email);
      if (exists) {
        throw Error('Email already exists.');
      }
      const user = { id: uuid4(), ...args.data };
      users.push(user);
      return user;
    },
    deleteUser: (parent, args, ctx, info) => {
      const userIndex = users.findIndex(user => user.id === args.id);
      if (userIndex === -1) {
        throw Error('User does not exist.');
      }
      const deletedUsers = users.splice(userIndex, 1);

      // delete user's posts and their associated comments
      posts = posts.filter(post => post.author !== args.id);
      for (let post of posts) {
        comments = comments.filter(comment => comment.post === post.id);
      }

      // delete user's comments
      comments = comments.filter(comment => comment.author !== args.id);

      return deletedUsers[0];
    },
    createPost: (parent, args, ctx, info) => {
      const userExists = users.some(user => user.id === args.data.author);
      if (!userExists) {
        throw Error('User does not exist.');
      }
      const post = { id: uuid4(), ...args.data };
      posts.push(post);
      return post;
    },
    deletePost: (parent, args, ctx, info) => {
      const postIndex = posts.findIndex(post => post.id === args.id);
      if (postIndex === -1) {
        throw Error('Post does not exist.');
      }
      const deletedPosts = posts.splice(postIndex, 1);

      // delete post's comments
      comments = comments.filter(comment => comment.post !== args.id);

      return deletedPosts[0];
    },
    createComment: (parent, args, ctx, info) => {
      const userExists = users.some(user => user.id === args.data.author);
      const postExists = posts.some(
        p => p.id === args.data.post && p.published,
      );
      if (!userExists) {
        throw Error('User does not exist.');
      }
      if (!postExists) {
        throw Error('Post does not exist.');
      }

      const comment = { id: uuid4(), ...args.data };
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
