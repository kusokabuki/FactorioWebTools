class TrainApp extends React.Component {
    constructor(props) {
        super(props)
        this.fuels = [
            { name: "石炭", acc_mult: 1, top_speed_mult: 1 },
            { name: "固形燃料", acc_mult: 1.2, top_speed_mult: 1.05 },
            { name: "ロケット燃料", acc_mult: 1.8, top_speed_mult: 1.15 },
            { name: "核燃料", acc_mult: 2.5, top_speed_mult: 1.15 },
        ];

        this.state = {
            fuel: 0,
            locomotives_actives: 1,
            locomotives_inavtives: 0,
            wagons: 0,
            Leadertype: 0 //0=locomotive, 1=cargo        
        }

    }

    render() {
        const { maxSpeed, tick_reached_max, distance, weight } = this.calculate();
        return (
            <div>
                <p>
                    <label>燃料：</label>
                    <select
                        value={this.state.fuel}
                        onChange={e => this.setState({ fuel: e.target.value })}
                    >
                        {this.fuels.map((f, i) => <option key={i} value={i}>{f.name}</option>)}
                    </select>
                </p>
                <p>
                    <label>前向き機関車：<input type='number' min="1" value={this.state.locomotives_actives} onChange={e => this.setState({ locomotives_actives: Number.parseInt(e.target.value) })}></input></label><br/>
                    <label>後向き機関車：<input type='number' min="0" value={this.state.locomotives_inavtives} onChange={e => this.setState({ locomotives_inavtives: Number.parseInt(e.target.value)  })}></input></label><br/>
                    <label>貨車：<input type='number' min="0" value={this.state.wagons} onChange={e => this.setState({ wagons: Number.parseInt(e.target.value) })}></input></label><br/>
                </p>
                <p>
                    <label>先頭車両の種類：</label>
                    <input type="radio" value="0" checked={this.state.Leadertype === 0}
                        onChange={e => this.setState({ Leadertype: 0 })} />機関車
                    <input type="radio" value="1" checked={this.state.Leadertype === 1}
                        onChange={e => this.setState({ Leadertype: 1 })} />貨車
                </p>
                <hr></hr>
                <table>
                    <tr>
                        <th>最高速度に到達する距離</th>
                        <td>{distance} m</td>
                    </tr>
                    <tr>
                        <th>レール換算</th>
                        <td>{ Math.ceil(distance / 2)} 個</td>
                    </tr>
                    <tr>
                        <th>時間</th>
                        <td>{tick_reached_max / 60 } 秒</td>
                    </tr>
                    <tr>
                        <th>最高速度</th>
                        <td>{maxSpeed * 60 * 60 * 60 / 1000} km/h</td>
                    </tr>
                    <tr>
                        <th>総重量</th>
                        <td>{weight} kg</td>
                    </tr>
                </table>
            </div>
            
        );
    }

    calculate() {
        // 機関車数
        const locomotives = this.state.locomotives_actives + this.state.locomotives_inavtives;
        // 総車両数
        const rollingStocks = locomotives + this.state.wagons;
        // 総重量（単位:kg）
        const weight = locomotives * 2000 + this.state.wagons * 1000;

        // 動力(単位:kJ)
        const energy = this.state.locomotives_actives * 10;
        // 空気抵抗
        const airResistance = this.state.Leadertype == 0 ? 0.0075 : 0.01;

        // 燃料の加速ボーナスと最高速度
        const { acc_mult, top_speed_mult } = this.fuels[this.state.fuel];
        const maxSpeed = 1.2 * top_speed_mult;

        // 出発時から n tick目の速度を v(n)、
        // n tick目で空気抵抗なしで加速した場合の速度を v'(n)とすると
        //   v'(n) = v(n) + (動力 - 摩擦) / 重量
        //   v(n + 1) = v'(n) - v'(n) * 空気抵抗 / 重量
        // v'(n)を取り除くと
        //   v(n+1) = (v(n) + (動力 - 摩擦) / 重量) / (1 - 空気抵抗 / 重量)
        // (1 - 空気抵抗 / 重量)を p, (動力 - 摩擦) / 重量) / p を q とすると
        //   v(n+1) = p * v(n) + q
        // 漸化式の一般項より
        //   v(n) = (v(1) - a) * p ^ (n - 1) + a
        //             (a = q / (1 - p))
        // 最高速度 max に達するのは v(n_max) > max のときなのでこれを n_max について解くと
        //   (v1 - a) * p ^ (n_max - 1) + a > max
        //   n_max > log_p((max - a) * p / (v1 - a)
        // 現在位置は各tickごと速度v(n) だけ移動するので n tick 後の位置は
        //   ∑ v(k) {k = 1,n}
        //   = (v1 - a) * (p ^ n - 1) / (p - 1) + n * a
        // 以上により最高速度到達時の位置を計算できる

        const p = (1 - airResistance / weight * 1000);
        const q = (energy * acc_mult - 0.5 * rollingStocks) / weight * p;
        const v1 = energy * acc_mult / weight * p;
        const a = q / (1 - p);
        const maxn = Math.log((maxSpeed - a) * p / (v1 - a)) / Math.log(p);
        const distance = (v1 - a) * (Math.pow(p, maxn) - 1) / (p - 1) + maxn * a;

        return {
            maxSpeed: maxSpeed,
            tick_reached_max: maxn,
            distance: distance,
            weight: weight
        }
    }
}

ReactDOM.render(<TrainApp />, document.getElementById("app"));