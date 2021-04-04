/* jshint esversion: 6 */

import React, { useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import SignupForm from "./authentication/signup";
import SigninForm from "./authentication/signin";
import Search from "./search/search";
import ProfileGeneric from "./search/profile-generic";
import Profile from "./functions/profile";
import RandomChat from "./functions/randomChat";
import Credits from "./functions/credits";
import VideoChat from "./functions/videoChat";
import Call from "./functions/call"

import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";
import { Redirect } from "react-router-dom";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import Store, { Context } from "./Store";
import axios from "axios";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { Link } from "react-router-dom";

//https://utsearch.tech new production
//https://idk-lmao.herokuapp.com/graphql production
//http://localhost:5000 local
export const domain = "https://utsearch.tech";

export const client = new ApolloClient({
  uri: domain + "/graphql",
  cache: new InMemoryCache(),
  // tell apollo client to send my session cookie to backend so that the request can be authenticated
  credentials: "include",
});

function PrivateRoute({ children, ...rest }) {
  const [state, dispatch] = useContext(Context);
  const isAuthenticated = state.user !== undefined && state.user !== null;
  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (isAuthenticated) {
          return children;
        } else {
          return (
            <Redirect to={{ pathname: "/signin", state: { from: location } }} />
          );
        }
      }}
    />
  );
}

function SimpleMenu() {
  const [state, dispatch] = useContext(Context);
  const history = useHistory();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  if (state.user !== undefined && state.user !== null) {
    const username = state.user.username;

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleProfile = () => {
      handleClose();
      history.push("/profile/" + username);
    };

    const handleSearch = () => {
      handleClose();
      history.push("/search");
    };

    const handleRandomChat = () => {
      handleClose();
      history.push("/random-chat");
    };

    const handleVideoChat = () => {
      handleClose();
      history.push("/video-chat");
    }

    const handleCall = () => {
      handleClose();
      history.push("/call");
    }

    const handleSignOut = () => {
      handleClose();
      axios
        .get(domain + "/signout", {
          withCredentials: true,
        })
        .then(() => {
          dispatch({ type: "SET_USER", payload: null });
          history.push("/signin");
        });
    };
    return (
      <div>
        <Button
          id="openmenu-btn"
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          {username}
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleProfile}>Profile</MenuItem>
          <MenuItem onClick={handleSearch}>Search</MenuItem>
          <MenuItem onClick={handleRandomChat}>Random Chat</MenuItem>
          <MenuItem onClick={handleVideoChat}>Video Chat</MenuItem>
          <MenuItem onClick={handleCall}>Call</MenuItem>
          <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
        </Menu>
      </div>
    );
  } else {
    return null;
  }
}

function Main() {
  const history = useHistory();
  const [state, dispatch] = useContext(Context);
  console.count("main");
  let username = undefined;
  if (state.user !== undefined && state.user !== null) {
    username = state.user.username;
  } else {
    username = undefined;
  }
  useEffect(() => {
    if (state.user !== undefined) {
      return;
    } else {
      client
        .query({
          query: gql`
            query {
              profile {
                username
                email
                bio
                tags
                friends
                blocked
              }
            }
          `,
        })
        .then((res) => {
          dispatch({ type: "SET_USER", payload: res.data.profile });
          console.log(res);
        })
        .catch((err) => {
          dispatch({ type: "SET_USER", payload: null });
          console.log(err);
        });
    }
  }, [username]);
  if (state.user === undefined) {
    return <div></div>;
  }
  return (
    <div id="body-wrapper">
      <header>
        <SimpleMenu></SimpleMenu>
      </header>
      <div id="meat">
        <Switch>
          <Route exact path="/">
            <Redirect to="/signin" />
          </Route>
          <Route exact path="/signup">
            <SignupForm></SignupForm>
          </Route>
          <Route exact path="/signin">
            <SigninForm></SigninForm>
          </Route>
          <PrivateRoute exact path="/search">
            <Search></Search>
          </PrivateRoute>
          <PrivateRoute exact path="/random-chat">
            <RandomChat></RandomChat>
          </PrivateRoute>
          <PrivateRoute exact path="/video-chat">
            <VideoChat></VideoChat>
          </PrivateRoute>
          <PrivateRoute exact path="/call">
            <Call></Call>
          </PrivateRoute>
          <PrivateRoute exact path="/profile/:username">
            <ProfileGeneric></ProfileGeneric>
          </PrivateRoute>
          <PrivateRoute exact path="/profile/:username/edit">
            <Profile></Profile>
          </PrivateRoute>
          <Route exact path="/credits">
            <Credits></Credits>
          </Route>
        </Switch>
      </div>
      <footer></footer>
    </div>
  );
}

export default function App() {
  return (
    <Store>
      <ApolloProvider client={client}>
        <Router>
          <Main></Main>
        </Router>
      </ApolloProvider>
    </Store>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
