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

const EDIT_FRIEND_REQUESTS = gql`
  mutation($input: String!) {
    CreateFriendRequest(input: $input)
  }
`;

const EDIT_BLOCKED = gql`
  mutation($input: String!) {
    CreateBlocked(input: $input) {
      friends
      friendRequestsReceived
      friendRequestsSent
      blocked
    }
  }
`;

function ProfileGeneric() {
  const [state, dispatch] = useContext(Context);
  const [bio, setBio] = useState([]);
  const [tags, setTags] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const { username } = useParams();

  const handleFriendSave = function () {
    client
      .mutate({
        variables: { input: username },
        mutation: EDIT_FRIEND_REQUESTS,
      })
      .then((result) => {
        dispatch({
          type: "EDIT_FRIEND_REQUESTS",
          payload: result.data.CreateFriendRequest,
        });
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleBlockedSave = function () {
    client
      .mutate({ variables: { input: username }, mutation: EDIT_BLOCKED })
      .then((result) => {
        console.log(result);
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
  }, [username]);

  let friendButton;
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
    if (state.user.friends.includes(username)) {
      friendButton = (
        <button
          id="profilegeneric-friends"
          className={"profilegeneric-button " + buttonClass}
        >
          Friends
        </button>
      );
    } else if (
      state.user.friendRequestsReceived.includes(username) ||
      state.user.friendRequestsSent.includes(username)
    ) {
      friendButton = (
        <button
          id="profilegeneric-pendingfriend"
          className={"profilegeneric-button " + buttonClass}
        >
          Pending Friend
        </button>
      );
    } else {
      friendButton = (
        <button
          className={"profilegeneric-button " + buttonClass}
          onClick={isBlocked === true ? undefined : handleFriendSave}
        >
          +Friend
        </button>
      );
    }
    editbtn = <div></div>;
    let blockbtn;
    if (isBlocked === true) {
      blockbtn = (
        <button
          className={"profilegeneric-button " + buttonClass}
          id="blocked-btn"
        >
          Blocked
        </button>
      );
    } else {
      blockbtn = (
        <button
          className={"profilegeneric-button " + buttonClass}
          onClick={handleBlockedSave}
        >
          Block
        </button>
      );
    }
    fourbtns = (
      <div>
        {friendButton}
        <Link to="/call">
          <button className={"profilegeneric-button " + buttonClass}>Call</button>
        </Link>
        <Link to="/video-chat">
          <button className={"profilegeneric-button " + buttonClass}>Chat</button>
        </Link>
        {blockbtn}
      </div>
    );
  } else {
    editbtn = (
      <button id="edit-btn">
        <Link to={"/profile/" + username + "/edit"}>
          <Icon id="edit">edit_icon</Icon>
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
