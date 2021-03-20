/* jshint esversion: 6 */

import { useContext } from "react";
import "./profile.css";
import "../index.css";
import Icon from "@material-ui/core/Icon";
import Tabs from "../components/tabs";
import { Redirect, useParams } from "react-router";
import { Context } from "../Store";

function Profile() {
  const { username } = useParams();
  const [state, dispatch] = useContext(Context);

  if (username !== state.user.username) {
    return <p>"You can't do that."</p>;
  }

  const tags = state.user.tags;

  //Tabs functionality from https://www.digitalocean.com/community/tutorials/react-tabs-component
  return (
    <div id="profile-wrapper">
      <div id="profile-picture-wrapper">
        <img
          id="profile-picture"
          src={"../media/default.png"}
          alt="Profile Picture"
        />
        <button id="img-btn">
          <Icon>edit_icon</Icon>
        </button>
      </div>

      <h1 id="profile-name">{username}</h1>

      {tags.map((tag) => {
        return <div>{tag}</div>;
      })}

      <div id="button-wrapper">
        <Tabs>
          <div className="profile-buttons" label="My Info">
            <div>
              <textarea
                className="profile-input"
                placeholder="Your Bio"
                name="Text1"
                rows="5"
              ></textarea>
            </div>
            <div>
              <textarea
                className="profile-input"
                placeholder="Your Tags"
                name="Text1"
                rows="5"
              ></textarea>
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

export default Profile;
