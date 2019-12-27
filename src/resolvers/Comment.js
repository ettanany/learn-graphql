const Comment = {
  post: (parent, args, { db }, info) => {
    return db.posts.find(post => post.id === parent.post);
  },
  author: (parent, args, { db }, info) => {
    return db.users.find(user => user.id === parent.author);
  },
};

export default Comment;
