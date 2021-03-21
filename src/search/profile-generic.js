/* jshint esversion: 6 */

import React, { useEffect, useContext, useState } from "react";
import ReactDOM from "react-dom";
import "../index.css";
import "./profile-generic.css";
import { useParams } from "react-router";
import { Context } from "../Store";
import { client } from "..";
import { gql } from "@apollo/client";

function ProfileGeneric() {
  const [state, dispatch] = useContext(Context);
  const [tags, setTags] = useState([]);
  const { username } = useParams();

  useEffect(() => {
    client
      .query({
        query: gql`
          query($input: ProfileGenericInput!) {
            profileGeneric(input: $input) {
              username
              tags
            }
          }
        `,
        variables: { input: {
          username: username
        } },
      })
      .then((result) => {
        setTags(result.data.profileGeneric.tags);
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  return (
    <div id="profilegeneric-wrapper">
      <div>
        <img id="profilegeneric-picture" src={"../media/profilepic.png"} />
      </div>
      <h2>{username}</h2>
      <div id="profilegeneric-buttons">
        <button className="profilegeneric-button">+Friend</button>
        <button className="profilegeneric-button">Call</button>
        <button className="profilegeneric-button">Chat</button>
        <button className="profilegeneric-button">Block</button>
      </div>
      <div id="profilegeneric-bio">this is my biography.</div>
      <div id="profilegeneric-tags">
        {tags.map((tag) => {
          return <div className="profilegeneric-tag">{tag}</div>;
        })}
      </div>
    </div>
  );
}

export default ProfileGeneric;