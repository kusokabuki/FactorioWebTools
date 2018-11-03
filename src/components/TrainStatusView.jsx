import React from 'react';
import defs from '../defines';

const gameSpeed2kmph = (spd) => spd * 60 * 60 * 60 / 1000;

// 列車を編成する
const organizeTrain = (train) => {
    const varr = train.vehicles.concat();
    const formation = [];

    if (varr[train.leader] != 0) {
        formation.push(defs.vehicles[train.leader].img);
        varr[train.leader]--;
    }

    [0,2,3,1].forEach(i => {
        for (let j = 0; j < varr[i]; j++) {
            formation.push(defs.vehicles[i].img);
        }
    });
        
    return formation.reverse();
}

export default (props) => {    
    const train = props.train;
    const formation = organizeTrain(train);

    return (
        <div className="statusView">
            <h2>列車パラメータ</h2>
            <div>
                {formation.map((f, i) => <img className="vehicle" key={f + i} src={"img/" + f} />)}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>制限速度</th>
                        <th>重量</th>
                        <th>動力</th>
                        <th>摩擦</th>
                        <th>制動力</th>
                        <th>空気抵抗</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{gameSpeed2kmph(train.limitSpeed)} km/h</td>
                        <td>{train.weight} kg</td>
                        <td>{train.power}</td>
                        <td>{train.friction}</td>
                        <td>{train.braking}</td>
                        <td>{train.airResistance}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}