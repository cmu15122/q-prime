import React, { Component } from 'react';

import Navbar from '../components/navbar/Navbar';
import SettingsMain from '../components/settings/SettingsMain';

import SettingsDataService from "../services/SettingsService";

class Settings extends Component {
  state = {
    queueData: null
  };

  componentDidMount() {
    SettingsDataService.getAll()
      .then(res => {
        this.setState({ 
          queueData: res.data
        });
        document.title = res.data.title;
      });
  };

  render() {
    return (
      <div className="Settings" style={{backgroundColor: this.props.theme.palette.background.default}}>
        <Navbar theme={this.props.theme} queueData={this.state.queueData} />
        <SettingsMain theme={this.props.theme} queueData={this.state.queueData}/>
      </div>
    );
  }
}

export default Settings;
