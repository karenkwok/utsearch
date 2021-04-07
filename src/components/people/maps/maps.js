/* jshint esversion: 6 */

import { useState } from "react";
import "./maps.css";
import "../../../index.css";
import GoogleMapReact from "google-map-react";
const MyLocation = ({ text }) => <div>{text}</div>;

function Maps() {
  // set default location to UTSC (if the user's browser doesnt support HTML5 or if they decide to turn location off)
  const [lat, setLat] = useState(43.783195941658995);
  const [long, setLong] = useState(-79.18734841588014);

  // set user's location to where they are
  if (navigator.geolocation) {
    const location = (position) => {
      setLat(position.coords.latitude);
      setLong(position.coords.longitude);
    }
    navigator.geolocation.getCurrentPosition(location);
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <GoogleMapReact bootstrapURLKeys={{ key: "AIzaSyA-Srzn7JIgECii-KKAKSzhf-aixVZngpI" }}
          defaultCenter={{
            lat: lat,
            lng: long
          }}
          defaultZoom={11}>
        <MyLocation lat={lat} lng={long} text="&#128514;" />
      </GoogleMapReact>
    </div>
  );
}

export default Maps;
