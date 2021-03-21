/* jshint esversion: 6 */

const express = require("express");
const session = require("express-session");
const http = require("http");
const mongoose = require("mongoose");
const { ApolloServer, AuthenticationError } = require("apollo-server-express");
const User = require("./models/users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const cors = require("cors");
const MongoStore = require("connect-mongo");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// The GraphQL schema in string form
const typeDefs = `
  type User { username: String, email: String, tags: [String] }
  type Query { GetUsers(searchValue: String): [User], profile: User, profileGeneric(input: ProfileGenericInput): User }
  input CreateUserInput {
    username: String
    password: String
    email: String
  }
  input ProfileGenericInput {
    username: String
  }
  type Mutation {
    CreateTag(input: String): [String], 
    CreateUser(input: CreateUserInput): User
  }
`;

// The resolvers
const resolvers = {
  Query: {
    GetUsers: async (parent, args, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      const allUsers = await User.find();
      return allUsers;
    },
    profile: async (parent, args, context) => {
      // context.user is the "profile" (username and email)
      // if no user with that cookie
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      else return context.user;
    },
    profileGeneric: async (parent, args, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      else {
        const profile = await User.findOne({username: args.input.username});
        return profile;
      }
    },
  },
  Mutation: {
    CreateTag: async (_, { input }, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      else {
        const updatedUser = await User.findOneAndUpdate(
          { username: context.user.username },
          { $push: { tags: input } },
          { new: true }
        );
        return updatedUser.tags;
      }
    },
    CreateUser: async (_, { input }) => {
      const newUser = User({ username: input.username, email: input.email, tags: [] });
      await newUser.setPassword(input.password);
      await newUser.save();
      return newUser;
    },
  },
};

// Initialize the app
const app = express();

// enables communication if frontend is on diff port than backend
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(
  session({
    secret: "plkojihughfgd",
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  context: ({ req }) => {
    return { user: req.user };
  },
});

server.applyMiddleware({
  app,
  cors: { origin: "http://localhost:3000" },
});

app.post(
  "/signin",
  express.json(),
  passport.authenticate("local"),
  function (req, res, next) {
    res.json(req.user);
  }
);

app.get("/signout", (req, res, next) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  res.json("You have signed out.");
});

app.use(express.static("build"));

// fixes the CANNOT GET/ when u visit a page thats not "/"
app.get("*", (req, res, next) => {
  res.sendFile("index.html", { root: __dirname + "/build" });
});

const PORT = process.env.PORT || 5000;

http.createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
