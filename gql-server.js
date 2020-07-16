require("dotenv").config();

const http = require("http");
const path = require("path");

const cloudinary = require("cloudinary");
const express = require("express");
const mongoose = require("mongoose");

const { ApolloServer } = require("apollo-server-express");

const {
  fileLoader,
  mergeTypes,
  mergeResolvers,
} = require("merge-graphql-schemas");

const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT;

const { authCheckMiddleware } = require("./helpers/auth");

const app = express();
const httpserver = http.createServer(app);

const db = async () => {
  try {
    const success = await mongoose.connect(
      mongoUri,
      {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      console.log("mongo connected")
    );
  } catch (error) {
    console.log("ERROR", error);
  }
};

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, "./typeDefs")));

const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, "./resolvers"))
);

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({
    req,
    res,
  }),
});

db();

apolloServer.applyMiddleware({ app });

app.get("/api", authCheckMiddleware, (req, res) =>
  res.json({ msg: "api endpoint reached" })
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post("/uploadimages", authCheckMiddleware, (req, res) => {
  cloudinary.uploader.upload(
    req.body.image,
    (result) => {
      res.send({
        url: result.url,
        public_id: result.public_id,
      });
    },
    { public_id: `${Date.now()}`, resource_type: "auto" }
  );
});

app.post("/removeimage", authCheckMiddleware, (req, res) => {
  let image_id = req.body.public_id;

  cloudinary.uploader.destroy(image_id, (error, result) => {
    if (error) return res.json({ success: false, error });
    res.send("ok");
  });
});

app.listen(port, () =>
  console.log(
    `gql-server running on port ${port} access data at http://localhost:${port}${apolloServer.graphqlPath}`
  )
);
