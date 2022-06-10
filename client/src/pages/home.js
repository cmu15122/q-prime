import React, { Component } from 'react';
import StudentMain from '../components/home/student/StudentMain';
import SharedMain from '../components/home/shared/SharedMain';

import LoginAdminNavbar from '../components/navbar/LoginAdminNavbar'

class Home extends Component {
  state = {
    queueData: null
  };

  componentDidMount() {
    this.callBackendAPI()
        .then(res => {
          this.setState({ 
            queueData: res
          });
        })
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
          <LoginAdminNavbar theme={this.props.theme}/>
          <SharedMain
            theme={this.props.theme}
            queueData={this.state.queueData}
          />
          <StudentMain 
            theme={this.props.theme}
            queueData={this.state.queueData}
          />
      </div>
    );
  }
}
  
export default Home;
