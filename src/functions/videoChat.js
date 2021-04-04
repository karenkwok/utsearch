/* jshint esversion: 6 */

import React from 'react';
import "./randomChat.css";
import "../index.css";

import VideoChatComponent from "../components/video-chat-component";



class VideoChat extends React.Component {
  render() {
    return (

      <div id="video-chat-wrapper">
      <VideoChatComponent url={'/video-chat'}/>
      </div>
    );
  }
}

export default VideoChat;
