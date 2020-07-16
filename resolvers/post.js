const { posts } = require("../temp");

const { DateTimeResolver } = require("graphql-scalars");

const { authCheck } = require("../helpers/auth");

const totalPosts = () => posts.length;
const allPosts = async (_, args, { req }) => {
  await authCheck(req);
  return posts;
};

const newPost = (_, args) => {
  const post = {
    id: posts.length + 1,
    ...args.input,
  };
  posts.push(post);
  return post;
};

module.exports = {
  Query: {
    totalPosts,
    allPosts,
  },
  Mutation: {
    newPost,
  },
};
