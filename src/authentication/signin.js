/* jshint esversion: 6 */

import { useContext, useState } from "react";
import "./signin.css";
import "../index.css";
import { domain } from "../index";
import { Link, Redirect, useHistory } from "react-router-dom";
import { Context } from "../Store";

const axios = require("axios");

function SigninForm() {
  // initial form state values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [state, dispatch] = useContext(Context);
  const history = useHistory();

  if (state.user !== null && state.user !== undefined) {
    return <Redirect to={{ pathname: "/search" }} />;
  }

  const handleUsernameChange = function (event) {
    setUsername(event.target.value);
  };

  const handlePasswordChange = function (event) {
    setPassword(event.target.value);
  };

  const handleSubmit = function (event) {
    event.preventDefault();
    axios
      .post(
        domain + "/signin",
        {
          username,
          password,
        },
        { withCredentials: true }
      )
      .then((result) => {
        dispatch({ type: "SET_USER", payload: result.data });
        history.push("/search");
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div id="signinform-wrapper">
      <h1>UTSearCh</h1>
      <h2>Sign In</h2>
      <form id="signinform" onSubmit={handleSubmit}>
        <p className="signinform-labels">Username</p>
        <input
          type="text"
          className="signinform-fields"
          name="username"
          maxlength="20"
          value={username}
          onChange={handleUsernameChange}
        />

        <p className="signinform-labels">Password</p>
        <input
          type="password"
          className="signinform-fields"
          name="password"
          value={password}
          onChange={handlePasswordChange}
        />

        <input type="submit" id="signin-btn" value="Sign In" />
      </form>
      <Link to="/signup">Don't have an account? Sign Up.</Link>
    </div>
  );
}

export default SigninForm;
