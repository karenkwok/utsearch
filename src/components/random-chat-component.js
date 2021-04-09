/* jshint esversion: 6 */

import React, { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";
import Peer from "simple-peer";
import "../index.css";
import styled from "styled-components";

/*
Base Video Chat Structure
https://github.com/coding-with-chaim/react-video-chat
https://www.youtube.com/watch?v=BpN6ZwFjbCY

Handling Disconnected Call
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
  flex-wrap: wrap;
  width: 100%;
  justify-content: center;
  margin: 0 0 10px 0;
`;

const Title = styled.h1`
  margin: 0;
`;

const Box = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  width: 50%;
`;

const StrangerList = styled.div`
  display: flex;
  flex-direction: column;
  height: 100px;
  overflow: scroll;
  padding: 20px;
  min-height: 0;
`;

const Video = styled.video`
  border: 1px solid blue;
  width: 320px;
  height: 240px;
  margin: 10px;
`;

const EmptyVideo = styled.div`
  border: 1px solid blue;
  background-color: black;
  width: 320px;
  height: 240px;
  border-radius: 10px;
  margin: 10px;
`;

function RandomChatComponent(){
  // States for the call connection steps
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [callerStream, setCallerStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);

  // Video Call Button option states
  const [muteBtnState, setMuteBtnState] = useState("Mute Me");
  const [hideBtnState, setHideBtnState] = useState("Hide Me");
  const [muteCallerBtnState, setMuteCallerBtnState] = useState("Mute Stranger");
  const [hideCallerBtnState, setHideCallerBtnState] = useState("Hide Stranger");

  //Hooks for the video streams
  const userVideo = useRef();
  const partnerVideo = useRef();

  //Hooks for the socket and peer
  const socket = useRef();
  const peerRef = useRef();

  /* Events for the connected user */
  function connectUser() {
    socket.current = io.connect('/random-chat');

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
      setMuteBtnState("Mute Me");
      setHideBtnState("Hide Me");
      setMuteCallerBtnState("Mute Stranger");
      setHideCallerBtnState("Hide Stranger");
      socket.current.destroy();
      setCallAccepted(false);
      connectUser();
    })
  }

  /* Upon clicking past intro, automatically attempt to connect user */
  useEffect(() => {
    connectUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  var signOutButtonXpath = "//li[text()='Sign Out']";
  var signOutButton = document.evaluate(signOutButtonXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  var profileXpath = "//li[text()='Profile']";
  var profileButton = document.evaluate(profileXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  var searchXpath = "//li[text()='Search']";
  var searchButton = document.evaluate(searchXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  signOutButton.onclick = function() {
    leavePageDisconnect();
  }

  profileButton.onclick = function() {
    leavePageDisconnect();
  }

  searchButton.onclick = function() {
    leavePageDisconnect();
  }

  /* Connection events if user is the caller */
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
      setCallerStream(stream);
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

  /* Accept the call and share stream from receiving end */
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
      setCallerStream(stream);

      partnerVideo.current.srcObject = stream;
    });
    peerRef.current = peer;

    peer.signal(callerSignal);
  }

  function leavePageDisconnect() {
    stream.getTracks().forEach(function(track) {
      track.stop();
    });

    socket.current.destroy();
    setCallAccepted(false);
    setMuteBtnState("Mute Me");
    setHideBtnState("Hide Me");
    setMuteCallerBtnState("Mute Stranger");
    setHideCallerBtnState("Hide Stranger");
  }

  // Disconnect from the call
  function disconnectCall() {
    socket.current.destroy();
    setCallAccepted(false);
    setMuteBtnState("Mute Me");
    setHideBtnState("Hide Me");
    setMuteCallerBtnState("Mute Stranger");
    setHideCallerBtnState("Hide Stranger");
    connectUser();
  }

  /* Functions for muting/hiding video/sound */
  function muteMyVideo(){
    if (hideBtnState === "Hide Me") {
      setHideBtnState("Show Me");
    } else {
      setHideBtnState("Hide Me");
    }
    stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
  }

  function muteMySound(){
    if (muteBtnState === "Mute Me") {
      setMuteBtnState("Unmute Me");
    } else {
      setMuteBtnState("Mute Me");
    }
    stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
  }

  function muteTheirVideo(){
    if (hideCallerBtnState === "Hide Stranger") {
      setHideCallerBtnState("Show Stranger");
    } else {
      setHideCallerBtnState("Hide Stranger");
    }
    callerStream.getVideoTracks()[0].enabled = !callerStream.getVideoTracks()[0].enabled;
  }

  function muteTheirSound(){
    if (muteCallerBtnState === "Mute Stranger") {
      setMuteCallerBtnState("Unmute Stranger");
    } else {
      setMuteCallerBtnState("Mute Stranger");
    }
    callerStream.getAudioTracks()[0].enabled = !callerStream.getAudioTracks()[0].enabled;
  }

  /* Conditional Elements */

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

  let disconnectButton;
  if (!receivingCall && Object.keys(users).length === 0) {
    disconnectButton = (
      <div>
        <button onClick={disconnectCall}>Reconnect</button>
      </div>
    )
  }

  let videoText;
  if (!receivingCall) {
    videoText = (
      <>
        <Box>You</Box>
        <Box>Stranger</Box>
      </>
    )
  } else {
    videoText = (
      <>
        <Box>You</Box>
        <Box>
            A secret stranger is calling you
        </Box>
      </>
    )
  }

  let userButtons;
  if (Object.keys(users).length > 1) {
    userButtons = (
      <StrangerList>
        <Title>Current Strangers Available:</Title>
        {Object.keys(users).map((key, index) => {
          if (key === yourID) {
            return null;
          }
          return (
            <button key={key} onClick={() => callPeer(key)}>Call Stranger {index}</button>
          );
        })}
      </StrangerList>
    )
  } else if (!callAccepted) {
    userButtons = (
      <StrangerList>You are the only one here</StrangerList>
    )
  }

  let muteButtons;
  if (callAccepted) {
    muteButtons =  (
      <>
      <Box>
      <button key="muteMyVid" onClick={() => muteMyVideo()}>{hideBtnState}</button>
      <button key="muteMySound" onClick={() => muteMySound()}>{muteBtnState}</button>
      </Box>

      <Box>
      <button key="muteTheirVid" onClick={() => muteTheirVideo()}>{hideCallerBtnState}</button>
      <button key="muteTheirSound" onClick={() => muteTheirSound()}>{muteCallerBtnState}</button>
      </Box>
      </>
    )
  } else {
    if (!receivingCall) {
      muteButtons =  (
        <>
          <Box>
            <button key="muteMyVid" onClick={() => muteMyVideo()}>{hideBtnState}</button>
            <button key="muteMySound" onClick={() => muteMySound()}>{muteBtnState}</button>
          </Box>

          <Box></Box>
        </>
      )
    } else {
      muteButtons =  (
        <>
          <Box>
            <button key="muteMyVid" onClick={() => muteMyVideo()}>{hideBtnState}</button>
            <button key="muteMySound" onClick={() => muteMySound()}>{muteBtnState}</button>
          </Box>

          <Box>
              <button onClick={acceptCall}>Accept</button>
          </Box>
        </>
      )
    }
  }

  /* Render the elements onto the page */
  return (
    <Container>
      <Row>
        <Title>Random Chat - Who Will You Meet?</Title>
      </Row>
      <Row>
        {UserVideo}
        {PartnerVideo}
      </Row>
      <Row>
        {videoText}
      </Row>
      <Row>
        {muteButtons}
      </Row>

      <Row>
        {userButtons}
      </Row>
      <Row>
        {disconnectButton}
      </Row>
    </Container>
  );
}

export default RandomChatComponent;
