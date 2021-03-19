/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "../index.css";
import "./profile-generic.css";
import Icon from "@material-ui/core/Icon";

class ProfileGeneric extends React.Component {
    render() {
      return (
        <div id="profilegeneric-wrapper">
          <div>
            <img id="profilegeneric-picture" src={"../media/profilepic.png"} />
          </div>
          <h2>Username</h2>
          <div id="profilegeneric-buttons">
            <button>Friend</button>
            <button>Call</button>
            <button>Chat</button>
            <button>Block</button>
          </div>
          <div id="profilegeneric-bio">
            this is my biography.
          </div>
          <div id="profilegeneric-tags">
            these are my super cool tags.
          </div>
        </div>
      );
    }
  }
  
  export default ProfileGeneric;