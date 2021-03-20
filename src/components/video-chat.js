/* jshint esversion: 6 */

import React, { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";
import Peer from "simple-peer";
import "../index.css";
import { Link } from "react-router-dom";
import { gql } from "@apollo/client";
import { client } from "../index";
import styled from "styled-components";

/*
Video Chat Functionality
https://github.com/coding-with-chaim/react-video-chat
https://www.youtube.com/watch?v=BpN6ZwFjbCY

Disconnected Call
https://www.youtube.com/watch?v=7a_vgmEZrhE
*/

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Video = styled.video`
  border: 1px solid blue;
  width: 49%;
  height: 100%;
  margin: 1px;
`;

const EmptyVideo = styled.div`
  border: 1px solid blue;
  background-color: black;
  width: 49%;
  height: 100%;
  border-radius: 30px;
`;

const Text = styled.div`
  width: 50%;
  height: 50%;
  text-align: center;
`;

function VideoChat(){
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const socket = useRef();
  const peerRef = useRef();

  function connectUser() {
    socket.current = io.connect("/");

    //Get the user's webcam as the stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    })

    socket.current.on("yourID", (id) => {
      setYourID(id);
    })
    socket.current.on("allUsers", (users) => {
      setUsers(users);
    })

    socket.current.on("hey", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    })

    socket.current.on("user left", () => {
      socket.current.destroy();
      setCallAccepted(false);
      connectUser();
    })
  }

  useEffect(() => {
    connectUser();
  }, []);

  function callPeer(id) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", data => {
      socket.current.emit("callUser", { userToCall: id, signalData: data, from: yourID })
    })

    peer.on("stream", stream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    socket.current.on("callAccepted", signal => {
      setUsers({});

      setCallAccepted(true);
      setReceivingCall(false);
      socket.current.removeListener('allUsers');
      peer.signal(signal);
    })
    peerRef.current = peer;
  }

  function acceptCall() {
    setCallAccepted(true);
    setReceivingCall(false);
    socket.current.removeListener('allUsers');
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", data => {
      socket.current.emit("acceptCall", { signal: data, to: caller, from: yourID })
    })

    peer.on("stream", stream => {
      setUsers({});
      setReceivingCall(false);

      partnerVideo.current.srcObject = stream;
    });
    peerRef.current = peer;

    peer.signal(callerSignal);
  }

  function disconnectCall() {
    socket.current.destroy();
    setCallAccepted(false);
    connectUser();
  }

  let UserVideo;
  if (stream) {
    UserVideo = (
      <Video playsInline muted ref={userVideo} autoPlay />
    );
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = (
      <Video playsInline ref={partnerVideo} autoPlay />
    );
  } else {
    PartnerVideo = (
      <EmptyVideo />
    );
  }

  let incomingCall;
  if (receivingCall) {
    incomingCall = (
      <div>
        <p>A secret stanger is calling you</p>
        <button onClick={acceptCall}>Accept</button>
      </div>
    )
  }

  let disconnectButton;
  if (!receivingCall && Object.keys(users).length == 0) {
    disconnectButton = (
      <div>
        <button onClick={disconnectCall}>Disconnect</button>
      </div>
    )
  }

  let videoText = (
    <>
      <Text>You</Text>
      <Text>Stranger</Text>
    </>
  )

  let userButtons;
  if (Object.keys(users).length > 1) {
    userButtons = (
      Object.keys(users).map((key, index) => {
        if (key === yourID) {
          return null;
        }
        return (
          <button key={key} onClick={() => callPeer(key)}>Call Stranger {index}</button>
        );
      })
    )
  } else if (!callAccepted) {
    userButtons = (
      <Text>You are the only one here</Text>
    )
  }
  return (
    <Container>
      <Row>
        {UserVideo}
        {PartnerVideo}
      </Row>
      <Row>
        {videoText}
      </Row>

      <Row>
        {userButtons}
      </Row>
      <Row>
        {incomingCall}
      </Row>
      <Row>
        {disconnectButton}
      </Row>
    </Container>
  );
}

export default VideoChat;
