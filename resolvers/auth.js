const shortid = require("shortid");

const { DateTimeResolver } = require("graphql-scalars");

const { gql } = require("apollo-server-express");

const { authCheck } = require("../helpers/auth");

const User = require("../models/user");

const profile = async (_, args, { req }) => {
  const currentUser = await authCheck(req);
  return await User.findOne({ email: currentUser.email }).exec();
};

const userCreate = async (_, args, { req }) => {
  const currentUser = await authCheck(req);
  const user = await User.findOne({ email: currentUser.email });

  return user
    ? user
    : new User({
        email: currentUser.email,
        username: shortid.generate(),
      }).save();
};

const userUpdate = async (_, args, { req }) => {
  const currentUser = await authCheck(req);
  console.log(args);
  const updatedUser = await User.findOneAndUpdate(
    { email: currentUser.email },
    { ...args.input },
    { new: true }
  ).exec();

  return updatedUser;
};

module.exports = {
  Query: {
    profile,
  },
  Mutation: {
    userCreate,
    userUpdate,
  },
};
