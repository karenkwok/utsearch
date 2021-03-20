/* jshint esversion: 6 */

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express");
const { makeExecutableSchema } = require("graphql-tools");
const User = require("./models/users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const cors = require("cors");
const socket = require("socket.io");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// The GraphQL schema in string form
const typeDefs = `
  type User { username: String, email: String }
  type Query { users: [User] }
  input CreateUserInput {
    username: String
    password: String
    email: String
  }
  type Mutation {
    CreateUser(input: CreateUserInput): User
  }
`;

// The resolvers
const resolvers = {
  Query: {
    users: async () => {
      const allUsers = await User.find();
      return allUsers;
    },
  },
  Mutation: {
    CreateUser: async (_, { input }) => {
      const newUser = User({ username: input.username, email: input.email });
      await newUser.setPassword(input.password);
      await newUser.save();
      return newUser;
    },
  },
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Initialize the app
const app = express();

// enables communication if frontend is on diff port than backend
app.use(cors({origin: "http://localhost:3000"}));

// The GraphQL endpoint
app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));

// GraphiQL, a visual editor for queries
app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));

app.use(express.static("build"));

const PORT = process.env.PORT || 5000;

/*
Video Chat Functionality:
https://github.com/coding-with-chaim/react-video-chat
https://www.youtube.com/watch?v=BpN6ZwFjbCY
*/

const server = http.createServer(app);

const io = socket(server);

const users = {};
const connected = {};
const pairs = [];

io.on('connection', socket => {
  //For new connections, save user id
    if (!users[socket.id]) {
        users[socket.id] = socket.id;
        connected[socket.id] = socket.id;
    }

    //Update all connected users with connected users
    socket.emit("yourID", socket.id);
    io.sockets.emit("allUsers", connected);

    //Delete users if they disconnect
    socket.on('disconnect', () => {
      for (let pair of pairs) {
        if (pair.includes(socket.id)) {
          let index = pair.indexOf(socket.id);
          if (index == 0) {
            socket.to(pair[1]).emit("user left");
          } else {
            socket.to(pair[0]).emit("user left");
          }
        }
      }


      delete users[socket.id];
      delete connected[socket.id];
      io.sockets.emit("allUsers", connected);
    });

    //Call a user
    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from, to: data.userToCall});
    });

    //Let calling user know call is accepted
    socket.on("acceptCall", (data) => {
        pairs.push([data.to, data.from]);
        delete connected[data.to];
        delete connected[data.from];
        io.to(data.to).emit('callAccepted', data.signal);
        io.sockets.emit("allUsers", connected);
    });
});

server.listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
