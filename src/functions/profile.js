import { useContext, useState } from "react";
import "./profile.css";
import "../index.css";
import Icon from "@material-ui/core/Icon";
import { useParams } from "react-router";
import { Context } from "../Store";
import { client } from "..";
import { gql } from "@apollo/client";
import profilepic from "./profilepic.png";
import { Link } from "react-router-dom";

const EDIT_BIO = gql`
  mutation($input: String!) {
    CreateBio(input: $input)
  }
`;

const CREATE_TAG = gql`
  mutation($input: String!) {
    CreateTag(input: $input)
  }
`;

function Profile() {
  const [state, dispatch] = useContext(Context);
  const [bio, setBio] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState(state.user.tags);
  const [error, setError] = useState("");
  const { username } = useParams();

  if (username !== state.user.username) {
    return <p id="you-cant-do-that">You can't do that.</p>;
  }

  const handleBioChange = function (event) {
    setBio(event.target.value);
  };

  const handleTagChange = function (event) {
    setTag(event.target.value);
  };

  const handleBioSave = function () {
    client
      .mutate({ variables: { input: bio }, mutation: EDIT_BIO })
      .then((result) => {
        dispatch({ type: "EDIT_BIO", payload: result.data.CreateBio });
        setBio(result.data.CreateBio);
        setBio("");
      })
  };

  const handleTagSave = function () {
    if (!tag || tag.trim() === "") {
      setError("Tag cannot be empty.");
      return;
    }
    else if (tags.length === 30) {
      setError("You cannot create more than 30 tags.");
      return;
    }
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
      })
  };

  return (
    <div id="profile-wrapper">
      <button id="img-btn">
        <Link to={"/profile/" + username}>
          <Icon id="visibility">visibility</Icon>
        </Link>
      </button>
      <div id="profile-picture-wrapper">
        <img id="profile-picture" src={profilepic} alt="Profile" />
      </div>

      <h2 id="profile-name">{username}</h2>

      <div id="profile-bio-wrapper">
        <div id="profile-bio">{state.user.bio}</div>
      </div>

      <div id="profile-tags">
        {tags.map((tag) => {
          return <div className="profile-tag">{tag}</div>;
        })}
      </div>

      <div id="button-wrapper">
          <div className="profile-buttons" label="My Info">
            <div id="textarea-wrapper">
              <div className="textarea-save">
                <textarea
                  className="profile-input"
                  placeholder="Enter your bio (max 255 characters)"
                  maxLength="255"
                  name="Text1"
                  rows="6"
                  onChange={handleBioChange}
                  value={bio}
                ></textarea>
                <button className="profile-save" onClick={handleBioSave}>Save Bio</button>
              </div>
              <div className="textarea-save">
                <textarea
                  className="profile-input"
                  placeholder="Enter a tag (max 40 characters)"
                  maxLength="40"
                  name="Text1"
                  rows="6"
                  onChange={handleTagChange}
                  value={tag}
                ></textarea>
                <div id="profile-error">{error}</div>
                <button className="profile-save" onClick={handleTagSave}>Save Tag</button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

export default Profile;
