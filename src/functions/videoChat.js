/* jshint esversion: 6 */

import React from 'react';
import "./randomChat.css";
import "../index.css";

import VideoChatComponent from "../components/video-chat-component";



class VideoChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {video: false};
  }

  startMeeting = ev => {
    this.setState({ video: !this.state.video });
  }

  render() {
    return (

      <div id="video-chat-wrapper">

        {!this.state.video ?
          <>
            <h1>Meet A Student!</h1>
            <h3>Welcome to Random Chat!</h3>
            <p>Random Chat is a great way to meet new friends from UTSC!
            </p>
            <p>
              We show other anonymous students currently online, where you can send and/or accept invites to a video call!
            </p>

            <button id="meet-student-button" onClick={this.startMeeting}>Meet A Student!</button>
          </>
          :
          <VideoChatComponent />
        }
      </div>
    );
  }
}

export default VideoChat;
