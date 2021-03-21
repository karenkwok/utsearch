/* jshint esversion: 6 */

import { useContext, useState } from "react";
import "./profile.css";
import "../index.css";
import Icon from "@material-ui/core/Icon";
import Tabs from "../components/tabs";
import { useParams } from "react-router";
import { Context } from "../Store";
import { client } from "..";
import { gql } from "@apollo/client";

const CREATE_TAG = gql`
  mutation($input: String!) {
    CreateTag(input: $input)
  }
`;

function Profile() {
  const [state, dispatch] = useContext(Context);
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState(state.user.tags);
  const { username } = useParams();

  if (username !== state.user.username) {
    return <p>"You can't do that."</p>;
  }

  const handleTagChange = function (event) {
    setTag(event.target.value);
  };

  const handleTagSave = function () {
    client
      .mutate({
        variables: {
          input: tag,
        },
        mutation: CREATE_TAG,
      })
      .then((result) => {
        setTags(result.data.CreateTag);
        setTag("");
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

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
                onChange={handleTagChange}
                value={tag}
              ></textarea>
            </div>
            <button onClick={handleTagSave}>Save</button>
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
