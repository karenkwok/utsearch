/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "../index.css";
import "./search.css";
import { Link } from "react-router-dom";
import Icon from '@material-ui/core/Icon';

class Search extends React.Component {
  render() {
    return (
      <div id="search-wrapper">
        <h1>UTSearCh</h1>
        <h2>Search for tags below!</h2>
        <form id="search-box">
          <input type="text" id="search-field" />
          <button type="submit" id="search-btn"><Icon>search_icon</Icon></button>
        </form>
      </div>
    );
  }
}

export default Search;
