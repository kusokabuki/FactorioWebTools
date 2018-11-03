import React from 'react';
import defs from '../defines';

import TrainInputForm from './TrainInputForm.jsx';
import StatusView from './TrainStatusView.jsx';
import ResultView from './ResultView.jsx';
import GraphView from './GraphView.jsx';

import Train from './Train';

export default class TrainApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fuel: 3,
            braking_bonus: 1.00,
            locomotive_active: 1,
            locomotive_inactive: 0,
            cargo_wagon: 0,
            artillery_wagon: 0,
            leader: 0 // 先頭車両の種類
        }

        this.train = new Train();
        this.handleChangeInput = this.handleChangeInput.bind(this);
    }

    render() {
        this.train.update(this.state);
        const result = this.train.calc();
        return (
            <div>
                <TrainInputForm state={this.state} onChange={this.handleChangeInput} />
                <hr />
                <StatusView train={this.train} />
                <ResultView result={result} />
                {this.train.CanMove ? <GraphView data={result.graphData} maxspd_distance={result.maxspd_distance + result.maxspd_braking} /> : <span />}                
            </div>
        );
    }

    handleChangeInput(name, value) {
        const obj = {};
        obj[name] = value;
        this.setState(obj);        
    }    
}

