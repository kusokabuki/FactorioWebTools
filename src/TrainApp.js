class TrainApp extends React.Component {
    constructor(props) {
        super(props)
        this.fuels = [
            { name: "石炭", acc_mult: 1, top_speed_mult: 1 },
            { name: "固形燃料", acc_mult: 1.2, top_speed_mult: 1.05 },
            { name: "ロケット燃料", acc_mult: 1.8, top_speed_mult: 1.15 },
            { name: "核燃料", acc_mult: 2.5, top_speed_mult: 1.15 },
        ];

        this.vehicles = [
            { id:"locomotive_active", name: "機関車（前向き）", min:1, weight: 2000, max_speed: 1.2, max_power: 10, friction_force: 0.5, air_resistance: 0.0075},
            { id:"locomotive_inactive", name: "機関車（後向き）", min:0, weight: 2000, max_speed: 1.2, max_power: 0, friction_force: 0.5, air_resistance: 0.0075},
            { id:"cargo_wagon", name: "貨物車両", min:0, weight: 1000, max_speed: 1.5, max_power: 0, friction_force: 0.5, air_resistance: 0.01},
            { id:"artillery_wagon", name: "列車砲", min:0, weight: 4000, max_speed: 1.5, max_power: 0, friction_force: 0.5, air_resistance: 0.015},
        ];

        this.state = {
            fuel: 0,
            locomotive_active: 1,
            locomotive_inactive: 0,
            cargo_wagon: 0,
            artillery_wagon: 0,
            Leadertype: 0 //0=locomotive, 1=cargo        
        }

        this.handleChangeInput = this.handleChangeInput.bind(this);
    }

    handleChangeInput(e) {
        const idx = e.target.idx;
        const veh = this.vehicles[idx];
        const obj = {};
        obj[veh.id] = e.target.value;
        this.setState(obj);
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
                        {this.fuels.map((f, i) => 
                            <option key={f.name} value={i}>{f.name}</option>
                        )}
                    </select>
                </p>
                <ul>
                {this.vehicles.map((v, i) => 
                    <li key={v.id}>
                        <label>{v.name}：
                            <input type='number' min={v.min} value={this.state[v.id]} 
                                onChange={e => {
                                    const obj = {};
                                    obj[v.id] = Number.parseInt(e.target.value);
                                    this.setState(obj);
                                }} >
                            </input>
                        </label>
                    </li>
                )}
                </ul>
                <p>
                    <label>先頭車両の種類：</label>
                    {[0, 2, 3].map((i) =>
                        <span key={i}>
                            <input type="radio" value={i} checked={this.state.Leadertype === i}
                            onChange={e => this.setState({ Leadertype: i })} />{this.vehicles[i].name}    
                        </span>
                    )}
                </p>
                <hr></hr>
                <table>
                    <tbody>
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
                    </tbody>
                </table>
            </div>            
        );
    }

    calculate() {
        let weight = 0; // 重量
        let friction = 0; // 摩擦
        let power = 0; // 動力

        this.vehicles.forEach(v => {
            let n = this.state[v.id];
            weight += v.weight * n;
            friction += v.friction_force * n;
            power += v.max_power * n;
        });
        
        // 空気抵抗
        const airResistance = this.vehicles[this.state.Leadertype].air_resistance;

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
        const q = (power * acc_mult - friction) / weight * p;
        const v1 = power * acc_mult / weight * p;
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