import React, { Component } from 'react';

import Navbar from '../components/navbar/Navbar';
import MetricsMain from '../components/metrics/MetricsMain';

import MetricsDataService from '../services/MetricsService';

class Metrics extends Component {
    state = {
        queueData: null
    };

    componentDidMount() {
        MetricsDataService.getAll()
            .then(res => {
                this.setState({ 
                    queueData: res.data
                });
                document.title = res.data.title;
            });
    };

    render() {
        return (
            <div className="Metrics" style={{backgroundColor: this.props.theme.palette.background.default}}>
                <Navbar theme={this.props.theme} queueData={this.state.queueData} askQuestionOrYourEntry={true}/>
                {
                    this.state.queueData != null && 
                    <MetricsMain theme={this.props.theme} queueData={this.state.queueData}/>
                }
            </div>
        );
    }
}

export default Metrics;
