/* jshint esversion: 6 */

import "./maps.css";
import "../../../index.css";
import GoogleMapReact from "google-map-react";
const MyLocation = ({ text }) => <div>{text}</div>;

function Maps() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <GoogleMapReact bootstrapURLKeys={{ key: "AIzaSyA-Srzn7JIgECii-KKAKSzhf-aixVZngpI" }}
          defaultCenter={{
            lat: 43.783195941658995,
            lng: -79.18734841588014
          }}
          defaultZoom={11}>
        <MyLocation lat={43.783195941658995} lng={-79.18734841588014} text="&#128514;" />
      </GoogleMapReact>
    </div>
  );
}

export default Maps;
