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
  updateUser: (parent, args, { db }, info) => {
    const {
      id,
      data: { email, name, age },
    } = args;

    const user = db.users.find(user => user.id === id);
    if (!user) {
      throw Error('User does not exist.');
    }

    if (typeof email === 'string') {
      const emailExists = db.users.some(user => user.email === email);
      if (emailExists) {
        throw Error('Email already exists.');
      }
      user.email = email;
    }

    if (typeof name === 'string') {
      user.name = name;
    }

    if (typeof age !== 'undefined') {
      user.age = age;
    }

    return user;
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
  updatePost: (parent, args, { db }, info) => {
    const {
      id,
      data: { title, body, published },
    } = args;

    const post = db.posts.find(post => post.id === id);
    if (!post) {
      throw Error('Post does not exist.');
    }

    if (typeof title === 'string') {
      post.title = title;
    }

    if (typeof body === 'string') {
      post.body = body;
    }

    if (typeof published === 'boolean') {
      post.published = published;
    }

    return post;
  },
  createComment: (parent, args, { db, pubsub }, info) => {
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
    pubsub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: 'CREATED',
        data: comment,
      },
    });
    return comment;
  },
  deleteComment: (parent, args, { db, pubsub }, info) => {
    const commentIndex = db.comments.findIndex(
      comment => comment.id === args.id,
    );
    if (commentIndex === -1) {
      throw Error('Comment does not exist.');
    }

    const [deletedComment] = db.comments.splice(commentIndex, 1);
    pubsub.publish(`comment ${deletedComment.post}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedComment,
      },
    });

    return deletedComment;
  },
  updateComment: (parent, args, { db, pubsub }, info) => {
    const {
      id,
      data: { text },
    } = args;

    const comment = db.comments.find(comment => comment.id === id);
    if (!comment) {
      throw Error('Comment does not exist.');
    }

    if (typeof text === 'string') {
      comment.text = text;
    }

    pubsub.publish(`comment ${comment.post}`, {
      comment: { mutation: 'UPDATED', data: comment },
    });

    return comment;
  },
};

export default Mutation;
