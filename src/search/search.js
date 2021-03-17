/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "../index.css";
import { Link } from "react-router-dom";
import Icon from '@material-ui/core/Icon';

class Search extends React.Component {
  render() {
    return (
      <div id="search-wrapper">
        <h1>UTSearCh</h1>
        <h2>Search for tags below!</h2>
        <form id="search-box">
          <input type="text" className="search-field" name="Search" />

          <Icon>search_icon</Icon>

          <input type="submit" id="search-btn" value="Sign In" />
        </form>
        <Link to="/signup">Don't have an account? Sign Up.</Link>
      </div>
    );
  }
}

export default Search;
