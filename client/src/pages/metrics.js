import React, { Component } from 'react';
import MetricsMain from '../components/metrics/MetricsMain'

class Metrics extends Component {
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
    const response = await fetch('http://localhost:8000/metrics');
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }

    return body;
  };

  render() {
    return (
      <div className="Metrics">
          <MetricsMain theme={this.props.theme} />
      </div>
    );
  }
}

export default Metrics;
