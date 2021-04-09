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

      <div id="random-chat-wrapper">

        {!this.state.video ?
          <>
            <h1>Video Chat - Chat With Friends!</h1>
            <h3>Welcome to Video Chat!</h3>
            <p>
              Here, you will be shown a list of users online and you can chat! Blocked users will not be shown.
            </p>

            <button id="meet-student-button" onClick={this.startMeeting}>Let's Video Chat!</button>
          </>
          :
          <VideoChatComponent />
        }
      </div>
    );
  }
}

export default VideoChat;
