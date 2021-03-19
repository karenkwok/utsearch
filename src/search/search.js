/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "../index.css";
import "./search.css";
import { Link } from "react-router-dom";
import Icon from "@material-ui/core/Icon";

class Search extends React.Component {
  render() {
    return (
      <div id="search-wrapper">
        <div id="search-bar">
          <form id="search-box">
            <input
              type="text"
              id="search-field"
              placeholder="Search for tags..."
            />
          </form>
          <button type="submit" id="search-btn">
            <Icon>search_icon</Icon>
          </button>
        </div>
        <div id="search-results">
          <h3>Search Results for</h3>
          <div id="search-results-container">
            <div className="result-example">
              <div>
                <img
                  className="result-picture"
                  src={"../media/profilepic.png"}
                />
              </div>
              <div className="result-text">
                <div className="result-username">
                  <Link to="/profile-generic" className="username">Username</Link>
                </div>
                <div className="result-bio">i eat pizza</div>
                <div className="result-tags">
                  <div className="result-tag">pizza</div>
                  <div className="result-tag">computer science</div>
                  <div className="result-tag">dogs</div>
                  <div className="result-tag">kinda funny</div>
                </div>
              </div>
            </div>
            <div className="result-example">
              <div>
                <img
                  className="result-picture"
                  src={"../media/profilepic.png"}
                />
              </div>
              <div className="result-text">
                <div className="result-username">
                  <Link to="/profile-generic" className="username">Username</Link>
                </div>
                <div className="result-bio">idk lmao</div>
                <div className="result-tags">
                  <div className="result-tag">4th year</div>
                  <div className="result-tag">CSCA08 mentor</div>
                  <div className="result-tag">international student</div>
                </div>
                <div className="result-tags">
                  <div className="result-tag">basketball</div>
                  <div className="result-tag">co-op</div>
                  <div className="result-tag">residence</div>
                </div>
              </div>
            </div>
            <div className="result-example">
              <div>
                <img
                  className="result-picture"
                  src={"../media/profilepic.png"}
                />
              </div>
              <div className="result-text">
                <div className="result-username">
                <Link to="/profile-generic" className="username">Username</Link>
                </div>
                <div className="result-bio">lalalalalala</div>
                <div className="result-tags">
                  <div className="result-tag">hackathons</div>
                  <div className="result-tag">volunteer</div>
                  <div className="result-tag">piano</div>
                  <div className="result-tag">sushi</div>
                  <div className="result-tag">pokemon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Search;
