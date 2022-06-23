import React, { Component } from 'react';

import Navbar from '../components/navbar/Navbar';
import HomeMain from '../components/home/HomeMain';

import HomeDataService from "../services/HomeService";

class Home extends Component {
  state = {
    queueData: null
  };

  componentDidMount() {
    HomeDataService.getAll()
        .then(res => {
          this.setState({ 
            queueData: res.data
          });
          document.title = res.data.title;
        })
        .catch(err => console.log(err));
  };

  render() {
    return (
      <div className="App">
          <Navbar theme={this.props.theme} queueData={this.state.queueData} />
          <HomeMain 
            theme={this.props.theme}
            queueData={this.state.queueData}
          />
      </div>
    );
  }
}

export default Home;
    