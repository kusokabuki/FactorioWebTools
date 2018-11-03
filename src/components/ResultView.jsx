import React from 'react';

const gameSpeed2kmph = (spd) => spd * 60 * 60 * 60 / 1000;

export default (props) => {
    const r = props.result;
    if (r === null) {
        return <div>この構成では列車は動きません.</div>
    } else {
        return (
            <div className="resultView">
                <h2>計算結果</h2>
                <table>
                    <thead>
                        <tr>
                            <th>最高速度</th>
                            <th>到達距離</th>
                            <th>到達時間</th>
                            <th>制動距離</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>                            
                            <td>{r.maxSpeed.toFixed(4)} km/h</td>
                            <td>{r.maxspd_distance.toFixed(4)} m</td>
                            <td>{(r.maxspd_time).toFixed(4)} 秒</td>
                            <td>{r.maxspd_braking.toFixed(4)} m</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
