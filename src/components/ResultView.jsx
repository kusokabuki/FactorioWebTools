import React from 'react';

export default (props) => {
    const train = props.train;
    
    if (!train.CanMove) {
        return (<div>
            <h2>計算結果</h2>
            <span className="warning">この構成では列車は動きません.</span>
        </div>);
    } else {
        const r = train.MaxSpeedInfo;
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
                            <td>{r.spd.toFixed(4)} km/h</td>
                            <td>{r.dis.toFixed(4)} m</td>
                            <td>{r.sec.toFixed(4)} 秒</td>
                            <td>{r.brk.toFixed(4)} m</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
