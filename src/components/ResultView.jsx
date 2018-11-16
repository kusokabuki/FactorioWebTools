import React from 'react';

export default (props) => {
    const train = props.train;
    const r = train.TopSpeedSummary;
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
                        <th>制動時間</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>                            
                        <td>{r.top_spd.toFixed(4)} km/h</td>
                        <td>{r.acc_dis.toFixed(4)} m</td>
                        <td>{r.acc_sec.toFixed(4)} s</td>
                        <td>{r.brk_dis.toFixed(4)} m</td>
                        <td>{r.brk_sec.toFixed(4)} s</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );    
}
