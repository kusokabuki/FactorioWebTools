import React from 'react';
import defs from '../defines';

export default (props) => {    
    const train = props.train;
    return (
        <div className="statusView">
            <h2>列車パラメータ</h2>
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
                        <td>{train.gameSpd2kmph(train.limitSpeed)} km/h</td>
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