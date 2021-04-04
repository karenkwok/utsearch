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

const EDIT_FRIENDS = gql`
  mutation($input: String!) {
    CreateFriends(input: $input)
  }
`;

const EDIT_BLOCKED = gql`
  mutation($input: String!) {
    CreateBlocked(input: $input)
  }
`;

function ProfileGeneric() {
  const [state, dispatch] = useContext(Context);
  const [bio, setBio] = useState([]);
  const [tags, setTags] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const { username } = useParams();

  const handleBlockedSave = function () {
    client
      .mutate({ variables: { input: username }, mutation: EDIT_BLOCKED })
      .then((result) => {
        dispatch({ type: "EDIT_BLOCKED", payload: result.data.CreateBlocked });
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    client
      .query({
        query: gql`
          query($input: ProfileGenericInput!) {
            profileGeneric(input: $input) {
              username
              bio
              tags
              blocked
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
        setBlocked(result.data.profileGeneric.blocked);
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  let editbtn;
  let fourbtns;
  if (state.user.username !== username) {
    // if other people's blocked list has my name or my blocked list has the name of the person whose profile i'm on
    let isBlocked =
      blocked.includes(state.user.username) ||
      state.user.blocked.includes(username);
    let buttonClass;
    if (isBlocked === true) {
      buttonClass = "blocked";
    } else {
      buttonClass = "notBlocked";
    }
    editbtn = <div></div>;
    fourbtns = (
      <div>
        <button className={"profilegeneric-button " + buttonClass}>
          +Friend
        </button>
        <button className={"profilegeneric-button " + buttonClass}>Call</button>
        <button className={"profilegeneric-button " + buttonClass}>Chat</button>
        <button
          className={"profilegeneric-button " + buttonClass}
          onClick={handleBlockedSave}
        >
          Block
        </button>
      </div>
    );
  } else {
    editbtn = (
      <button id="edit-btn">
        <Link to={"/profile/" + username + "/edit"}>
          <Icon>edit_icon</Icon>
        </Link>
      </button>
    );
    fourbtns = <div></div>;
  }

  return (
    <div id="profilegeneric-wrapper">
      {editbtn}
      <div id="profilegeneric-picture-wrapper">
        <img id="profilegeneric-picture" src={profilepic} />
      </div>
      <h2 id="profilegeneric-username">{username}</h2>
      <div id="profilegeneric-buttons">{fourbtns}</div>
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
