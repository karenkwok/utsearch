/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "./profile.css";
import "../index.css";
import { Link } from "react-router-dom";
import { gql } from "@apollo/client";
import { client } from "../index";

import Tabs from "../components/tabs";

class Profile extends React.Component {
  render() {
    //Tabs functionality from https://www.digitalocean.com/community/tutorials/react-tabs-component

    return (
      <div id="profile-wrapper">
        <div id="profile-picture-wrapper">
          <img id="profile-picture" src={"../media/default.png"} alt="Profile Picture"/>
          <button id="img-btn">Change</button>
        </div>

        <h1 id="profile-name">The Username</h1>
        <h3>FirstName LastName</h3>

        <div id="button-wrapper">
          <Tabs>
            <div className="profile-buttons" label="My Info">
              <div>
                <textarea className="profile-input" placeholder="Your Bio" name="Text1" rows="5"></textarea>
              </div>
              <div>
                <textarea className="profile-input" placeholder="Your Tags" name="Text1" rows="5"></textarea>
              </div>
              <button> Save</button>
            </div>
            <div className="profile-buttons" label="Friends">
              Your friends list is empty :(
            </div>
            <div className="profile-buttons" label="Blocked">
              Your blocked list is empty :)
            </div>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default Profile;
