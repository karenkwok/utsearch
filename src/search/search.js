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

const GET_USERS = gql`
  query($searchValue: String!) {
    GetUsers(searchValue: $searchValue) {
      username
      tags
    }
  }
`;

function Search() {
  const [state, dispatch] = useContext(Context);
  const [searchValue, setSearchValue] = useState("");
  const [searchValue2, setSearchValue2] = useState(searchValue);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchValueChange = function (event) {
    setSearchValue(event.target.value);
    setSearchValue2(event.target.value);
  };

  const handleSearch = function () {
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
      <div id="search-results">
        <h3>Search Results for {searchValue2}</h3>
        <div id="search-results-container">
          {searchResults.map((searchResult) => {
            return (
              <div className="result-example">
                <div>
                  <img
                    className="result-picture"
                    src={"../media/profilepic.png"}
                  />
                </div>
                <div className="result-text">
                  <div className="result-username">
                    <Link to={"/profile/" + searchResult.username} className="username">
                      {searchResult.username}
                    </Link>
                  </div>
                  <div className="result-bio">i eat pizza</div>
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
      </div>
    </div>
  );
}

export default Search;
