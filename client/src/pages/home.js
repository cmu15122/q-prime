import React, { Component } from 'react';
import StudentMain from '../components/home/student/StudentMain';
import SharedMain from '../components/home/shared/SharedMain';
import HomeMain from '../components/home/HomeMain';

import Navbar from '../components/navbar/Navbar'

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
          document.title = res.title;
          console.log("fetched!");
          console.log(res);
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
    const isLoggedIn = this.state.queueData?.isAuthenticated;
    let mainPage;
    if (isLoggedIn) {
      mainPage = <StudentMain 
                    theme={this.props.theme}
                    queueData={this.state.queueData}
                  />;
    } else {
      // mainPage = <LoginButton onClick={this.handleLoginClick} />;
    }

    return (
      <div className="App">
          <Navbar theme={this.props.theme} queueData={this.state.queueData} />
          <SharedMain
            theme={this.props.theme}
            queueData={this.state.queueData}
          />
          {mainPage}
      </div>
    );
  }
}
  
export default Home;
