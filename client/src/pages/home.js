import React, { Component } from 'react';
// import YourEntry from '../components/YourEntry';
// import RemoveQOverlay from '../components/RemoveQConfirm';
import Main from '../components/home/student/Main';

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
          <Main />
      </div>
    );
  }
}
  
export default Home;
