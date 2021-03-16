/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "./randomChat.css";
import "../index.css";
import { Link } from "react-router-dom";
import { gql } from "@apollo/client";
import { client } from "../index";


class RandomChat extends React.Component {
  render() {

    // Video Call functionality from
    // https://www.youtube.com/watch?v=DvlyzDZDEq4
    // https://github.com/WebDevSimplified/Zoom-Clone-With-WebRTC
    // 
    function startMeeting(e){
      document.getElementById("random-chat-wrapper").innerHTML = '<div id="video-grid"></div><div id="user-grid">You</div><button>Disconnect</button>';
      const videoGrid = document.getElementById('video-grid');
      const myVideo = document.createElement('video');
      myVideo.muted = true;

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
        addVideoStream(myVideo, stream, videoGrid);
      });
    }

    function addVideoStream(video, stream, videoGrid) {
      video.srcObject = stream;
      video.addEventListener('loadedmetadata', () => {
        video.play()
      });
      videoGrid.append(video);
      videoGrid.append("test");

    }

    return (
      <div id="random-chat-wrapper">
        <h1>Meet A Student!</h1>
        <h3>Welcome to Random Chat!</h3>
        <p>Random Chat is a great way to meet new friends from UTSC!
        </p>
        <p>
          We pick another student that is also using on this page and you can video chat together!
        </p>

        <button id="meet-student-button" onClick={startMeeting}>Meet A Student!</button>
      </div>
    );
  }
}

export default RandomChat;
