/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "../index.css";
import "./profile-generic.css";

class ProfileGeneric extends React.Component {
  render() {
    return (
      <div id="profilegeneric-wrapper">
        <div>
          <img id="profilegeneric-picture" src={"../media/profilepic.png"} />
        </div>
        <h2>Username</h2>
        <div id="profilegeneric-buttons">
          <button className="profilegeneric-button">+Friend</button>
          <button className="profilegeneric-button">Call</button>
          <button className="profilegeneric-button">Chat</button>
          <button className="profilegeneric-button">Block</button>
        </div>
        <div id="profilegeneric-bio">this is my biography.</div>
        <div id="profilegeneric-tags">
          <div className="profilegeneric-tag">these</div>
          <div className="profilegeneric-tag">are</div>
          <div className="profilegeneric-tag">my</div>
          <div className="profilegeneric-tag">super</div>
          <div className="profilegeneric-tag">awesome</div>
          <div className="profilegeneric-tag">tags.</div>
        </div>
      </div>
    );
  }
}

export default ProfileGeneric;
