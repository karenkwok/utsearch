/* jshint esversion: 6 */

import { useContext, useState } from "react";
import { Context } from "../../../Store";
import { client } from "../../..";
import "./maps.css";
import "../../../index.css";
import GoogleMapReact from "google-map-react";
import { gql } from "@apollo/client";
const MyLocation = ({ text }) => <div>{text}</div>;

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

  // set user's location to where they are
  if (navigator.geolocation) {
    const location = (position) => {
      setLat(position.coords.latitude);
      setLong(position.coords.longitude);
      client
        .mutate({ variables: { lat: lat, long: long }, mutation: EDIT_LOCATION })
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
        <MyLocation lat={lat} lng={long} text="&#128514;" />
      </GoogleMapReact>
    </div>
  );
}

export default Maps;
