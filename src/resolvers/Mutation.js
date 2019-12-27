import uuid4 from 'uuid/v4';

const Mutation = {
  createUser: (parent, args, { db }, info) => {
    const exists = db.users.some(user => user.email === args.data.email);
    if (exists) {
      throw Error('Email already exists.');
    }
    const user = { id: uuid4(), ...args.data };
    db.users.push(user);
    return user;
  },
  deleteUser: (parent, args, { db }, info) => {
    const userIndex = db.users.findIndex(user => user.id === args.id);
    if (userIndex === -1) {
      throw Error('User does not exist.');
    }
    const deletedUsers = db.users.splice(userIndex, 1);

    // delete user's posts and their associated comments
    db.posts = db.posts.filter(post => post.author !== args.id);
    for (let post of db.posts) {
      db.comments = db.comments.filter(comment => comment.post === post.id);
    }

    // delete user's comments
    db.comments = db.comments.filter(comment => comment.author !== args.id);

    return deletedUsers[0];
  },
  createPost: (parent, args, { db }, info) => {
    const userExists = db.users.some(user => user.id === args.data.author);
    if (!userExists) {
      throw Error('User does not exist.');
    }
    const post = { id: uuid4(), ...args.data };
    db.posts.push(post);
    return post;
  },
  deletePost: (parent, args, { db }, info) => {
    const postIndex = db.posts.findIndex(post => post.id === args.id);
    if (postIndex === -1) {
      throw Error('Post does not exist.');
    }
    const deletedPosts = db.posts.splice(postIndex, 1);

    // delete post's comments
    db.comments = db.comments.filter(comment => comment.post !== args.id);

    return deletedPosts[0];
  },
  createComment: (parent, args, { db }, info) => {
    const userExists = db.users.some(user => user.id === args.data.author);
    const postExists = db.posts.some(
      p => p.id === args.data.post && p.published,
    );
    if (!userExists) {
      throw Error('User does not exist.');
    }
    if (!postExists) {
      throw Error('Post does not exist.');
    }

    const comment = { id: uuid4(), ...args.data };
    db.comments.push(comment);
    return comment;
  },
  deleteComment: (parent, args, { db }, info) => {
    const commentIndex = db.comments.findIndex(
      comment => comment.id === args.id,
    );
    if (commentIndex === -1) {
      throw Error('Comment does not exist.');
    }
    const deletedComments = db.comments.splice(commentIndex, 1);
    return deletedComments[0];
  },
};

export default Mutation;
