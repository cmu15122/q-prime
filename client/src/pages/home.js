import React, { Component } from 'react';
import logo from '../logo.svg';

class Home extends Component {
  state = {
    data: null
  };

  componentDidMount() {
    this.callBackendAPI()
        .then(res => this.setState({ data: res.title }))
        .catch(err => console.log(err));
  };

  // fetching the GET route from the Express server which matches the GET route from server.js
  callBackendAPI = async () => {
    const response = await fetch('http://localhost:8000/');
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }

    return body;
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
          <p className="App-intro">{this.state.data}</p>
        </header>
      </div>
    );
  }
}
  
export default Home;
