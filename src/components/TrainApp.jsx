import React from 'react';
import defs from '../defines';

import TrainInputForm from './TrainInputForm.jsx';
import TrainFormationView from './TrainFormationView.jsx';
import StatusView from './TrainStatusView.jsx';
import ResultView from './ResultView.jsx';
import GraphView from './GraphView.jsx';
import ETACalcForm from './ETACalcForm.jsx';

import Train from '../models/Train';

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
        this.train.setState(this.state);
        return (
            <div>
                <TrainInputForm state={this.state} onChange={this.handleChangeInput} />
                <hr />
                <TrainFormationView train={this.train} />
                <StatusView train={this.train} />
                
                {this.train.CanMove ? (
                <>
                    <ResultView train={this.train} />
                    <hr className="clear"/>
                    <GraphView train={this.train}/>
                    <ETACalcForm train={this.train} />
                </>) : (
                    <div className="warning clear">
                        <h2>この構成では列車が動きません。</h2>
                    </div>
                )}   
                    <hr className="clear"/>             
            </div>
        );
    }

    handleChangeInput(name, value) {
        const obj = {};
        obj[name] = value;
        this.setState(obj);        
    }    
}

