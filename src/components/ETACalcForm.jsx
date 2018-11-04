import React from 'react';

export default class ETACalcForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            distance:100
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({distance:Number.parseInt(e.target.value)});
    }

    render() {
        const eta = this.props.train.calcEta(this.state.distance);
        return (
            <div className="etaForm">
                <h2>運行時間計算</h2>
                <p>
                <label> 駅間の距離：
                <input 
                    value={this.state.distance} 
                    onChange={this.handleChange} 
                    type="number" />
                </label>
                </p>
                <p>
                    運行時間予測：
                    <span>{eta} 秒</span>
                </p>
            </div>
        )
    }
}