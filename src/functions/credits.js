import "../index.css";
import "./credits.css"

function Credits() {
  /* Render the elements onto the page */
  return (
    <div>
      <h1>Credits</h1>

      <p>Special thanks to the following resources</p>
      <p>Without these tutorials, this project would not be possible.</p>

      <h3> Basic Video Chat Structure </h3>
      <h4> By Coding With Chaim </h4>
      <ul>
        <li><a href="https://github.com/coding-with-chaim/react-video-chat">Code</a></li>
        <li><a href="https://www.youtube.com/watch?v=BpN6ZwFjbCY">Video Tutorial</a></li>
      </ul>



      <h3> Handling Disconnected Calls </h3>
      <h4> By Coding With Chaim </h4>
      <ul>
        <li><a href="https://www.youtube.com/watch?v=7a_vgmEZrhE">Video Tutorial</a></li>
      </ul>

      <h3> Detecting Route Change in React </h3>
      <h4> By Nicolas Keller </h4>
      <ul>
        <li><a href="https://stackoverflow.com/a/60125216">Stackoverflow Answer</a></li>
      </ul>

      <h3> Tabs Component in React Structure </h3>
      <h4>By joshtronic</h4>
      <ul>
        <li><a href="https://www.digitalocean.com/community/tutorials/react-tabs-component">Online Tutorial</a></li>
      </ul>

      <h3> idk-lmao Icon </h3>
      <h4>By Jordan Feng</h4>
      <ul>
        <li><a href="https://jordanfeng.me">My Website (Feedback is always welcome) :D</a></li>
      </ul>

      <h3> Converting Image to favicon </h3>
      <h4>By favicon Generator</h4>
      <ul>
        <li><a href="https://www.favicon-generator.org/">Online Tool</a></li>
      </ul>
    </div>
  );
}

export default Credits;
