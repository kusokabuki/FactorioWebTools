import React from 'react';

export default class ETACalcForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            distance: 500
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({ distance: Number.parseInt(e.target.value) });
    }

    render() {
        const train = this.props.train;
        const eta = train.calcEta(this.state.distance);

        return (
            <div className="etaForm">
                <h2>運行時間計算</h2>
                <p>
                    <label> 駅間の距離：</label>
                    <input
                        value={this.state.distance}
                        onChange={this.handleChange}
                        min={2}
                        type="number" /> m

                </p>
                {!Number.isNaN(eta) ?
                <dl>
                    <dt>運行時間</dt>
                    <dd>{eta.ttl_sec.toFixed(2)} 秒</dd>
                    <dt>燃料消費(１車両あたり)</dt>
                    <dd> 
                        {(eta.fuel_consumed_joule / 1000).toFixed(2) + " KJ"}<br />
                        <img src={"img/" + train.fuel.img} alt={train.fuel.name} width={20} height={20} />
                                {eta.fuel_consumed_rate.toFixed(2)} 個分
                        
                    </dd>
                </dl> : <span>X</span>
                }
                
                    

            </div>
        )
    }
}