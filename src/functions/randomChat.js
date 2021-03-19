/* jshint esversion: 6 */

import React, { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";
import Peer from "simple-peer";
import "./randomChat.css";
import "../index.css";
import { Link } from "react-router-dom";
import { gql } from "@apollo/client";
import { client } from "../index";
import styled from "styled-components";

import VideoChat from "../components/video-chat";



class RandomChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {video: false};
  }

  startMeeting = ev => {
    this.setState({ video: !this.state.video });
  }


  render() {
    return (

      <div id="random-chat-wrapper">

        {!this.state.video ?
          <>
            <h1>Meet A Student!</h1>
            <h3>Welcome to Random Chat!</h3>
            <p>Random Chat is a great way to meet new friends from UTSC!
            </p>
            <p>
              We pick another student that is also using on this page and you can video chat together!
            </p>

            <button id="meet-student-button" onClick={this.startMeeting}>Meet A Student!</button>
          </>
          :
          <VideoChat/>
        }
      </div>
    );
  }
}

export default RandomChat;
