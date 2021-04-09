/* jshint esversion: 6 */

import { useEffect, useContext, useState } from "react";
import { Context } from "../../../Store";
import { client } from "../../..";
import "./maps.css";
import "../../../index.css";
import GoogleMapReact from "google-map-react";
import { gql } from "@apollo/client";
const Location = ({ username, emoji }) => (
  <div className="map-name">
    <div>{username}</div>
    <div>{emoji}</div>
  </div>
);

const GET_FRIENDS_LOCATION = gql`
  query {
    GetFriendsLocation {
      username
      myLocation {
        lat
        long
      }
    }
  }
`;

const EDIT_LOCATION = gql`
  mutation($lat: Float!, $long: Float!) {
    CreateLocation(lat: $lat, long: $long) {
      username
      myLocation {
        lat
        long
      }
    }
  }
`;

function Maps() {
  const [state, dispatch] = useContext(Context);
  // set default location to UTSC (if the user's browser doesnt support geolocation or if they decide to turn location off)
  const [lat, setLat] = useState(43.783195941658995);
  const [long, setLong] = useState(-79.18734841588014);
  const [friendsLocation, setfriendsLocation] = useState([]);

  useEffect(() => {
    // set user's location to where they are
    if (navigator.geolocation) {
      const location = (position) => {
        setLat(position.coords.latitude);
        setLong(position.coords.longitude);
        client
          .mutate({
            variables: { lat: position.coords.latitude, long: position.coords.longitude },
            mutation: EDIT_LOCATION,
          })
          .then((result) => {
            dispatch({
              type: "EDIT_LOCATION",
              payload: result.data.CreateLocation.myLocation,
            });
            console.log(result);
          })
          .catch((error) => {
            console.log(error);
          });
      };
      navigator.geolocation.getCurrentPosition(location);
    }
    client
      .query({ variables: {}, query: GET_FRIENDS_LOCATION })
      .then((result) => {
        setfriendsLocation(result.data.GetFriendsLocation);
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [lat, long]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyA-Srzn7JIgECii-KKAKSzhf-aixVZngpI" }}
        defaultCenter={{
          lat: lat,
          lng: long,
        }}
        defaultZoom={16}
      >
        <Location
          lat={lat}
          lng={long}
          username="me"
          emoji="&#128514;"
        />
        {friendsLocation.map((friendLocation) => {
          return (
            <Location
              lat={friendLocation.myLocation.lat}
              lng={friendLocation.myLocation.long}
              username={friendLocation.username}
              emoji="&#128540;"
            />
          );
        })}
      </GoogleMapReact>
    </div>
  );
}

export default Maps;
