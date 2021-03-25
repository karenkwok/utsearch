/* jshint esversion: 6 */

import { useContext, useState } from "react";
import "./signin.css";
import "../index.css";
import { Link, useHistory } from "react-router-dom";
import { Context } from "../Store";

function Credits() {
  /* Render the elements onto the page */
  return (
    <div>
      <h1> Basic Video Chat Structure </h1>
      <a href="https://github.com/coding-with-chaim/react-video-chat">Code</a>
      <a href="https://www.youtube.com/watch?v=BpN6ZwFjbCY">Video Tutorial</a>

      <h1> Handling Disconnected Calls </h1>
      <a href="https://www.youtube.com/watch?v=7a_vgmEZrhE">Video Tutorial</a>

      <h1> Alternating Tabs in React Structure </h1>
      <a href="https://www.digitalocean.com/community/tutorials/react-tabs-component">Online Tutorial</a>
    </div>
  );
}

export default Credits;
