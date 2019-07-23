import React, { Component } from "react";
import ReactDOM from "react-dom";

import "./index.css";
import "./app.css";

// const list = [
//   {
//     title: "React",
//     url: "https://facebook.github.io/react/",
//     author: "Jordan Walke",
//     num_comments: 3,
//     points: 4,
//     objectID: 0
//   },
//   {
//     title: "Redux",
//     url: "https://github.com/reactjs/redux",
//     author: "Dan Abramov, Andrew Clark",
//     num_comments: 2,
//     points: 5,
//     objectID: 1
//   }
// ];

const DEFAULT_QUERY = "redux";
const PATH_BASE = "https://hn.algolia.com/api/v1";
const [PATH_SEARCH, PARAM_SEARCH, PARAM_PAGE] = ["/search", "query=", "page="];
const [PARAM_HPP, DEFAULT_HPP] = ["hitsPerPage=", "100"];

let url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`;
console.log(url);
const URL_BASE = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}`;

// const isSearched = searchTerm => item =>
//   item.title.toLowerCase().includes(searchTerm.toLowerCase());

const Search = ({ value, onSearchChange, onSubmit, children }) => (
  <form onSubmit={onSubmit}>
    <input type="text" value={value} onChange={onSearchChange} />
    <button type="submit">{children}</button>
  </form>
);

const Button = ({ onClick, className = "", children }) => (
  <button type="button" className={className} onClick={onClick}>
    {children}
  </button>
);

const largeColumn = { width: "40%" };
const midColumn = { width: "30%" };
const smallColumn = { width: "10%" };

const Table = ({ list, onDismiss }) => (
  <div className="table">
    {list.map(item => (
      <div key={item.objectID} className="table-row">
        <span style={largeColumn}>
          <a href={item.url}>{item.title}</a>
        </span>
        <span style={midColumn}>{item.author}</span>
        <span style={smallColumn}>{item.num_comments}</span>
        <span style={smallColumn}>{item.points}</span>
        <span style={smallColumn}>
          <Button
            onClick={() => onDismiss(item.objectID)}
            className="button-online"
          >
            Dismiss
          </Button>
        </span>
      </div>
    ))}
  </div>
);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: DEFAULT_QUERY,
      searchkey: "",
      results: null
    };
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.needsFetch = this.needsFetch.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
  }
  onDismiss(itemId) {
    const { searchKey, results } = this.state;
    const updatedHits = results[searchKey].hits.filter(
      item => item.objectID !== itemId
    );
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page: results[searchKey].page }
      }
    });
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    const { results, searchKey } = this.state;
    const oldHits =
      results && results[searchKey] ? results[searchKey].hits : [];
    const updatedHits = [...oldHits, ...hits];
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  needsFetch(searchKey) {
    return !this.state.results[searchKey];
  }
  fetchSearchTopStories(searchTerm, page = 0) {
    console.log("featching " + searchTerm);
    fetch(
      `${URL_BASE}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
    )
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => error);
  }

  onSearchChange(event) {
    this.setState({
      searchTerm: event.target.value.toLowerCase()
    });
  }
  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsFetch(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }

    event.preventDefault();
  }
  render() {
    const { searchKey, searchTerm, results } = this.state;
    const result =
      results && results[searchKey] ? results[searchKey] : undefined;
    const page = result && result.page ? result.page : 0;
    const list = result ? result.hits : [];
    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onSearchChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        <Table list={list} onDismiss={this.onDismiss} />}
        <div className="interactions">
          <Button
            onClick={() => this.fetchSearchTopStories(searchTerm, page + 1)}
          >
            More
          </Button>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
