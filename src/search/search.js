/* jshint esversion: 6 */

import { React, useContext, useState } from "react";
import ReactDOM from "react-dom";
import "../index.css";
import "./search.css";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import Icon from "@material-ui/core/Icon";
import { Context } from "../Store";
import { client } from "..";
import { gql } from "@apollo/client";
import profilepic from "./profilepic.png";

const GET_USERS = gql`
  query($searchValue: String!) {
    GetUsers(searchValue: $searchValue) {
      username
      bio
      tags
    }
  }
`;

function Search() {
  const [state, dispatch] = useContext(Context);
  const [searchValue, setSearchValue] = useState("");
  const [searchValue2, setSearchValue2] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchValueChange = function (event) {
    setSearchValue(event.target.value);
  };

  const handleSearch = function () {
    setSearchValue2(searchValue);
    client
      .query({
        variables: {
          searchValue: searchValue,
        },
        query: GET_USERS,
      })
      .then((result) => {
        setSearchResults(result.data.GetUsers);
        setSearchValue("");
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  let results;
  if (searchResults.length === 0) {
    if (searchValue2 === "") {
      results = <div></div>;
    } else {
      results = (
        <div id="search-results">
          <p id="search-results-sentence">No results found for "{searchValue2}".</p>
        </div>
      );
    }
  } else {
    results = (
      <div id="search-results">
        <p id="search-results-sentence">Search results for "{searchValue2}".</p>
        {searchResults.map((searchResult) => {
          return (
            <div className="result-example">
              <div>
                <img
                  className="result-picture"
                  src={profilepic}
                />
              </div>
              <div className="result-text">
                <div className="result-username">
                  <Link
                    to={"/profile/" + searchResult.username}
                    className="username"
                  >
                    {searchResult.username}
                  </Link>
                </div>
                <div className="result-bio">{searchResult.bio}</div>
                <div className="result-tags">
                  {searchResult.tags.map((tag) => {
                    return <div className="result-tag">{tag}</div>;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div id="search-wrapper">
      <div id="search-bar">
        <form id="search-box">
          <input
            type="text"
            id="search-field"
            placeholder="Search for tags..."
            onChange={handleSearchValueChange}
            value={searchValue}
          />
        </form>
        <button type="submit" id="search-btn" onClick={handleSearch}>
          <Icon>search_icon</Icon>
        </button>
      </div>
      {results}
    </div>
  );
}

export default Search;
