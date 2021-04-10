/* jshint esversion: 6 */

//import sslRedirect from "heroku-ssl-redirect";
const sslRedirect = require("heroku-ssl-redirect").default;
const express = require("express");
const session = require("express-session");
const http = require("http");
const mongoose = require("mongoose");
const {
  ApolloServer,
  AuthenticationError,
  ApolloError,
} = require("apollo-server-express");
const User = require("./models/users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const cors = require("cors");
const socket = require("socket.io");
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
  type User {
    username: String,
    email: String,
    bio: String,
    tags: [String],
    friends: [String],
    friendRequestsReceived: [String],
    friendRequestsSent: [String],
    blocked: [String],
    myLocation: MyLocation
  }
  type Query {
    GetFriendsLocation: [FriendsLocation],
    GetUsers(searchValue: String): [User],
    profile: User,
    profileGeneric(input: ProfileGenericInput): User
  }
  input CreateUserInput {
    username: String
    password: String
    email: String
  }
  input ProfileGenericInput {
    username: String
  }
  type Mutation {
    CreateLocation(lat: Float, long: Float): User,
    FriendRequestResponse(user: String, acceptRequest: Boolean): User,
    CreateFriendRequest(input: String): [String],
    CreateFriends(input: String): [String],
    CreateBlocked(input: String): User,
    CreateBio(input: String): String,
    CreateTag(input: String): [String],
    CreateUser(input: CreateUserInput): User
  }
  type MyLocation {
    lat: Float,
    long: Float
  }
  type FriendsLocation {
    username: String,
    myLocation: MyLocation
  }
`;

// The resolvers
const resolvers = {
  Query: {
    GetFriendsLocation: async (_, {}, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      else {
        const userFriends = await User.find({
          username: { $in: context.user.friends },
          myLocation: { $ne: null },
        });
        return userFriends;
      }
    },
    GetUsers: async (parent, args, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      const allUsers = await await User.find().or([
        { tags: args.searchValue },
        { username: args.searchValue },
      ]);
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
        const profile = await User.findOne({ username: args.input.username });
        if (profile === null) {
          throw new ApolloError("User does not exist.");
        }
        return profile;
      }
    },
  },
  Mutation: {
    CreateLocation: async (_, { lat, long }, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      else {
        const updatedUser = await User.findOneAndUpdate(
          { username: context.user.username },
          { myLocation: { lat: lat, long: long } },
          { new: true }
        );
        return updatedUser;
      }
    },
    FriendRequestResponse: async (_, { user, acceptRequest }, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      else {
        if ((await User.findOne({ username: user })) === null) {
          throw new ApolloError("User does not exist.");
        } else if (context.user.username === user) {
          throw new ApolloError("You can't add yourself as a friend!");
        } else {
          const currentUser = await User.findOne({
            username: context.user.username,
          });
          if (currentUser.friendRequestsReceived.includes(user) === false)
            throw new ApolloError(
              "This user did not send you a friend request."
            );
        }

        if (acceptRequest === true) {
          const updatedUser = await User.findOneAndUpdate(
            { username: context.user.username },
            {
              $addToSet: { friends: user },
              $pull: { friendRequestsReceived: user },
            },
            { new: true }
          );
          const updatedOtherUser = await User.findOneAndUpdate(
            { username: user },
            {
              $addToSet: { friends: context.user.username },
              $pull: { friendRequestsSent: context.user.username },
            },
            { new: true }
          );
          return updatedUser;
        } else {
          const updatedUser = await User.findOneAndUpdate(
            { username: context.user.username },
            {
              $pull: { friendRequestsReceived: user },
            },
            { new: true }
          );
          const updatedOtherUser = await User.findOneAndUpdate(
            { username: user },
            {
              $pull: { friendRequestsSent: context.user.username },
            },
            { new: true }
          );
          return updatedUser;
        }
      }
    },
    CreateFriendRequest: async (_, { input }, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      else {
        if ((await User.findOne({ username: input })) === null) {
          throw new ApolloError("User does not exist.");
        } else if (context.user.username === input) {
          throw new ApolloError("You can't add yourself as a friend!");
        } else if (context.user.blocked.includes(input)) {
          throw new ApolloError("You blocked this user.");
        } else if (
          (await User.findOne({ username: input })).blocked.includes(
            context.user.username
          )
        ) {
          throw new ApolloError("This user blocked you.");
        } else if (context.user.friends.includes(input)) {
          throw new ApolloError("This user is already your friend!");
        }
        const updatedUser = await User.findOneAndUpdate(
          { username: context.user.username },
          { $addToSet: { friendRequestsSent: input } },
          { new: true }
        );
        const updatedOtherUser = await User.findOneAndUpdate(
          { username: input },
          { $addToSet: { friendRequestsReceived: context.user.username } },
          { new: true }
        );
        return updatedUser.friendRequestsSent;
      }
    },
    CreateFriends: async (_, { input }, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      else {
        if ((await User.findOne({ username: input })) === null) {
          throw new ApolloError("User does not exist.");
        } else if (context.user.username === input) {
          throw new ApolloError("You can't add yourself as a friend!");
        }
        const updatedUser = await User.findOneAndUpdate(
          { username: context.user.username },
          { $addToSet: { friends: input } },
          { new: true }
        );
        return updatedUser.friends;
      }
    },
    CreateBlocked: async (_, { input }, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      else {
        if ((await User.findOne({ username: input })) === null) {
          throw new ApolloError("User does not exist.");
        } else if (context.user.username === input) {
          throw new ApolloError("You can't block yourself!");
        }
        const updatedUser = await User.findOneAndUpdate(
          { username: context.user.username },
          {
            $addToSet: { blocked: input },
            $pull: {
              friends: input,
              friendRequestsSent: input,
              friendRequestsReceived: input,
            },
          },
          { new: true }
        );
        const otherUser = await User.findOneAndUpdate(
          { username: input },
          {
            $pull: {
              friends: context.user.username,
              friendRequestsSent: context.user.username,
              friendRequestsReceived: context.user.username,
            },
          },
          { new: true }
        );
        return updatedUser;
      }
    },
    CreateBio: async (_, { input }, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      else {
        if (input.length > 255) {
          throw new ApolloError("Bio must be 255 characters or less.");
        }
        const updatedUser = await User.findOneAndUpdate(
          { username: context.user.username },
          { bio: input },
          { new: true }
        );
        return updatedUser.bio;
      }
    },
    CreateTag: async (_, { input }, context) => {
      if (!context.user)
        throw new AuthenticationError("You must be logged in.");
      else {
        if (!input || input.trim() === "") {
          throw new ApolloError("Tag cannot be empty.");
        }
        else if (input.length > 40) {
          throw new ApolloError("Tag must be 40 characters or less.");
        }
        else if (context.user.tags.length === 30) {
          throw new ApolloError("You cannot create more than 30 tags.");
        }
        const updatedUser = await User.findOneAndUpdate(
          { username: context.user.username },
          { $push: { tags: input } },
          { new: true }
        );
        return updatedUser.tags;
      }
    },
    CreateUser: async (_, { input }) => {
      if (!input.username) {
        throw new ApolloError("You must enter a username.");
      } else if (input.username.length > 20) {
        throw new ApolloError("Username must be 20 characters or less.");
      } else if (!input.password) {
        throw new ApolloError("You must enter a password.");
      } else if (!input.email) {
        throw new ApolloError("You must enter an email.");
      } else if ((await User.findOne({ username: input.username })) !== null) {
        throw new AuthenticationError("Username already exists.");
      } else if (
        input.email.search(
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
        ) === -1
      ) {
        throw new ApolloError("Invalid email.");
      } else {
        const newUser = User({
          username: input.username,
          email: input.email,
          bio: "",
          tags: [],
        });
        await newUser.setPassword(input.password);
        await newUser.save();
        return newUser;
      }
    },
  },
};

// Initialize the app
const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(sslRedirect());
}

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

/*
Base Video Chat Structure:
https://github.com/coding-with-chaim/react-video-chat
https://www.youtube.com/watch?v=BpN6ZwFjbCY
*/

const HTTPServer = http.createServer(app);

const io = socket(HTTPServer);

const users = {};
const connected = {};
const pairs = [];

const randomChatNameSpace = io.of("/random-chat");
const callNameSpace = io.of("/call");
const videoChatNameSpace = io.of("/video-chat");

randomChatNameSpace.on("connection", (socket) => {
  //For new connections, save user id
  if (!users[socket.id]) {
    users[socket.id] = socket.id;
    connected[socket.id] = socket.id;
  }

  //Update all connected users with connected users
  socket.emit("yourID", socket.id);
  randomChatNameSpace.emit("allUsers", connected);

  //Delete users if they disconnect
  socket.on("disconnect", () => {
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
    randomChatNameSpace.emit("allUsers", connected);
  });

  //Call a user
  socket.on("callUser", (data) => {
    randomChatNameSpace.to(data.userToCall).emit("hey", {
      signal: data.signalData,
      from: data.from,
      to: data.userToCall,
    });
  });

  //Let calling user know call is accepted
  socket.on("acceptCall", (data) => {
    pairs.push([data.to, data.from]);
    delete connected[data.to];
    delete connected[data.from];
    randomChatNameSpace.to(data.to).emit("callAccepted", data.signal);
    randomChatNameSpace.emit("allUsers", connected);
  });
});

const videoUsers = [];
const videoConnected = [];
const videoPairs = [];

videoChatNameSpace.on("connection", (socket) => {
  //Return id to socket
  socket.emit("yourID", socket.id);

  //Get socket's username and then update list
  socket.on("ConnectUsername", (data) => {
    //For new connections, save user id and their username
    if (!users[socket.id]) {
      videoUsers[socket.id] = socket.id;
      videoConnected.push([socket.id, data.username]);
    }

    //Notify all current users of connected usernames
    videoChatNameSpace.emit("allUsers", videoConnected);
  });

  //Delete users if they disconnect
  socket.on("disconnect", () => {
    for (let pair of videoPairs) {
      //If one disconnects, notify other user
      if (pair.includes(socket.id)) {
        let index = pair.indexOf(socket.id);
        if (index == 0) {
          socket.to(pair[1]).emit("user left");
        } else {
          socket.to(pair[0]).emit("user left");
        }
      }
    }

    //Delete socket id and username pair from the list
    delete videoUsers[socket.id];
    for (let i = 0; i < videoConnected.length; i++) {
      if (videoConnected[i][0] == socket.id) {
        videoConnected.splice(i, 1);
      }
    }

    //Notify all other users of the change
    videoChatNameSpace.emit("allUsers", connected);
  });

  //Call a user
  socket.on("callUser", (data) => {
    let callerUsername = "";
    for (let i = 0; i < videoConnected.length; i++) {
      if (videoConnected[i][0] == data.from) {
        callerUsername = videoConnected[i][1];
      }
    }
    videoChatNameSpace.to(data.userToCall).emit("hey", {
      signal: data.signalData,
      from: data.from,
      fromUsername: callerUsername,
      to: data.userToCall,
    });
  });

  //Let calling user know call is accepted
  socket.on("acceptCall", (data) => {
    videoPairs.push([data.to, data.from]);

    //Users are not connected, now in a call
    for (let i = 0; i < videoConnected.length; i++) {
      if (videoConnected[i][0] == data.to) {
        videoConnected.splice(i, 1);
      }
    }
    let callerUser = "";
    for (let i = 0; i < videoConnected.length; i++) {
      if (videoConnected[i][0] == data.from) {
        callerUser = videoConnected[i][1];
        videoConnected.splice(i, 1);
      }
    }

    //Notify parties of the changes
    videoChatNameSpace
      .to(data.to)
      .emit("callAccepted", { signal: data.signal, username: callerUser });
    videoChatNameSpace.emit("allUsers", videoConnected);
  });
});

const callUsers = [];
const callConnected = [];
const callPairs = [];

callNameSpace.on("connection", (socket) => {
  //Return id to socket
  socket.emit("yourID", socket.id);

  //Get socket's username and then update list
  socket.on("ConnectUsername", (data) => {
    //For new connections, save user id and their username
    if (!users[socket.id]) {
      callUsers[socket.id] = socket.id;
      callConnected.push([socket.id, data.username]);
    }

    //Notify all current users of connected usernames
    callNameSpace.emit("allUsers", callConnected);
  });

  //Delete users if they disconnect
  socket.on("disconnect", () => {
    for (let pair of callPairs) {
      //If one disconnects, notify other user
      if (pair.includes(socket.id)) {
        let index = pair.indexOf(socket.id);
        if (index == 0) {
          socket.to(pair[1]).emit("user left");
        } else {
          socket.to(pair[0]).emit("user left");
        }
      }
    }

    //Delete socket id and username pair from the list
    delete callUsers[socket.id];
    for (let i = 0; i < callConnected.length; i++) {
      if (callConnected[i][0] == socket.id) {
        callConnected.splice(i, 1);
      }
    }

    //Notify all other users of the change
    callNameSpace.emit("allUsers", connected);
  });

  //Call a user
  socket.on("callUser", (data) => {
    let callerUsername = "";
    for (let i = 0; i < callConnected.length; i++) {
      if (callConnected[i][0] == data.from) {
        callerUsername = callConnected[i][1];
      }
    }
    callNameSpace.to(data.userToCall).emit("hey", {
      signal: data.signalData,
      from: data.from,
      fromUsername: callerUsername,
      to: data.userToCall,
    });
  });

  //Let calling user know call is accepted
  socket.on("acceptCall", (data) => {
    callPairs.push([data.to, data.from]);

    //Users are not connected, now in a call
    for (let i = 0; i < callConnected.length; i++) {
      if (callConnected[i][0] == data.to) {
        callConnected.splice(i, 1);
      }
    }
    let callerUser = "";
    for (let i = 0; i < callConnected.length; i++) {
      if (callConnected[i][0] == data.from) {
        callerUser = callConnected[i][1];
        callConnected.splice(i, 1);
      }
    }

    //Notify parties of the changes
    callNameSpace
      .to(data.to)
      .emit("callAccepted", { signal: data.signal, username: callerUser });
    callNameSpace.emit("allUsers", callConnected);
  });
});

HTTPServer.listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
