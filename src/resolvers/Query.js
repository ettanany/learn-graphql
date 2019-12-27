const Query = {
  users: (parent, args, { db }, info) => {
    if (!args.query) {
      return db.users;
    }
    return db.users.filter(user =>
      user.name.toLowerCase().includes(args.query.toLowerCase()),
    );
  },
  posts: (parent, args, { db }, info) => {
    const query = args.query && args.query.toLowerCase();
    if (!query) {
      return db.posts;
    }
    return db.posts.filter(
      post =>
        post.title.toLowerCase().includes(query) ||
        post.body.toLowerCase().includes(query),
    );
  },
  comments: (parent, args, { db }, info) => {
    return db.comments;
  },
  me: () => ({
    id: '123abc',
    name: 'John',
    email: 'john@example.com',
    age: 26,
  }),
  post: () => ({
    id: '456def',
    title: 'GraphQL Intro',
    body: '',
    published: false,
  }),
};

export default Query;
