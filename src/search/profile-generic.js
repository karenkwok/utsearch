/* jshint esversion: 6 */

import React, { useEffect, useContext, useState } from "react";
import ReactDOM from "react-dom";
import "../index.css";
import "./profile-generic.css";
import { useParams } from "react-router";
import { Context } from "../Store";
import { client } from "..";
import { gql } from "@apollo/client";
import profilepic from "./profilepic.png";
import Icon from "@material-ui/core/Icon";
import { Link } from "react-router-dom";

function ProfileGeneric() {
  const [state, dispatch] = useContext(Context);
  const [bio, setBio] = useState([]);
  const [tags, setTags] = useState([]);
  const { username } = useParams();

  useEffect(() => {
    client
      .query({
        query: gql`
          query($input: ProfileGenericInput!) {
            profileGeneric(input: $input) {
              username
              bio
              tags
            }
          }
        `,
        variables: {
          input: {
            username: username,
          },
        },
      })
      .then((result) => {
        setBio(result.data.profileGeneric.bio);
        setTags(result.data.profileGeneric.tags);
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  let editbtn;
  if (state.user.username !== username) {
    editbtn = <div></div>;
  } else {
    editbtn = (
      <button id="edit-btn">
        <Link to={"/profile/" + username + "/edit"}>
          <Icon>edit_icon</Icon>
        </Link>
      </button>
    );
  }

  return (
    <div id="profilegeneric-wrapper">
      {editbtn}
      <div id="profilegeneric-picture-wrapper">
        <img id="profilegeneric-picture" src={profilepic} />
      </div>
      <h2 id="profilegeneric-username">{username}</h2>
      <div id="profilegeneric-buttons">
        <button className="profilegeneric-button">+Friend</button>
        <button className="profilegeneric-button">Call</button>
        <button className="profilegeneric-button">Chat</button>
        <button className="profilegeneric-button">Block</button>
      </div>
      <div id="profilegeneric-bio-wrapper">
        <div id="profilegeneric-bio">{bio}</div>
      </div>
      <div id="profilegeneric-tags">
        {tags.map((tag) => {
          return <div className="profilegeneric-tag">{tag}</div>;
        })}
      </div>
    </div>
  );
}

export default ProfileGeneric;
