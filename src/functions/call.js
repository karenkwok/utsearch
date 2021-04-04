/* jshint esversion: 6 */

import React from 'react';
import "./randomChat.css";
import "../index.css";

import CallComponent from "../components/call-component";



class Call extends React.Component {
  render() {
    return (

      <div id="video-chat-wrapper">
      <CallComponent url={'/call'}/>
      </div>
    );
  }
}

export default Call;
