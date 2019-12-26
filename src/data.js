const users = [
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

const posts = [
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

const comments = [
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
    author: '3',
    post: '102',
  },
];

export { users, posts, comments };
