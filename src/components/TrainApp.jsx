import React from 'react';
import { debug } from 'util';

export default class TrainApp extends React.Component {
    constructor(props) {
        super(props)
        this.fuels = [
            { name: "石炭", acc_mult: 1, top_speed_mult: 1 },
            { name: "固形燃料", acc_mult: 1.2, top_speed_mult: 1.05 },
            { name: "ロケット燃料", acc_mult: 1.8, top_speed_mult: 1.15 },
            { name: "核燃料", acc_mult: 2.5, top_speed_mult: 1.15 },
        ];

        this.breakings =[
            0, 0.1, 0.25, 0.40, 0.55, 0.70, 0.85, 1.00 
        ];

        this.vehicles = [
            { id:"locomotive_active", name: "機関車（前向き）", min:1, weight: 2000, max_speed: 1.2, max_power: 10, friction_force: 0.5, air_resistance: 0.0075, braking_force:10},
            { id:"locomotive_inactive", name: "機関車（後向き）", min:0, weight: 2000, max_speed: 1.2, max_power: 0, friction_force: 0.5, air_resistance: 0.0075, braking_force:10},
            { id:"cargo_wagon", name: "貨物車両", min:0, weight: 1000, max_speed: 1.5, max_power: 0, friction_force: 0.5, air_resistance: 0.01, braking_force:3},
            { id:"artillery_wagon", name: "列車砲", min:0, weight: 4000, max_speed: 1.5, max_power: 0, friction_force: 0.5, air_resistance: 0.015, braking_force:3},
        ];

        this.state = {
            fuel: 3,
            breaking_bonus: 1.00,
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
                <p>
                    <label>制動力ボーナス：</label>
                    <select
                        value={this.state.breaking_bonus}
                        onChange={e => this.setState({ breaking_bonus: Number.parseFloat(e.target.value)})}
                    >
                        {this.breakings.map((f, i) => 
                            <option key={f} value={f}>{Math.round(f * 100)} %</option>
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
                <CalcResult result={ this.calculate() }></CalcResult>
            </div>            
        );
    }

    calculate() {
        let weight = 0; // 重量
        let friction = 0; // 摩擦
        let power = 0; // 動力
        let breaking = 0; // 制動力

        this.vehicles.forEach(v => {
            let n = this.state[v.id];
            weight += v.weight * n;
            friction += v.friction_force * n;
            power += v.max_power * n;
            breaking += v.braking_force * (this.state.breaking_bonus + 1) * n;
        });
        
        // 空気抵抗
        const airResistance = this.vehicles[this.state.Leadertype].air_resistance;

        // 燃料の加速ボーナスと最高速度
        const { acc_mult, top_speed_mult } = this.fuels[this.state.fuel];
        const limitSpeed = 1.2 * top_speed_mult;

        // パワーが足りない場合
        if (power * acc_mult - friction <= 0) {
            return NaN;
        }

        // Factorioの列車は動力による加速は現在の速度によらず一定で、空気抵抗は速度に比例して大きくなるようである。
        // 出発時から n tick目の速度を v(n)、加速を accとすると
        //   acc = (動力 - 摩擦) / 重量
        //   v(n + 1) = (v(n) + acc) * (1 - 空気抵抗 / 重量)
        // となることが観察により確認された。
        // (1 - 空気抵抗 / 重量)を p, acc / p を q とすると
        //   v(n+1) = p * v(n) + q
        // で、この漸化式の一般項は
        //   v(n) = (v(1) - a) * p ^ (n - 1) + a
        //             (a = q / (1 - p))
        // となる。ここで a は v(n+1) = v(n) = a 。つまり a は最高速度である。
        // ただし、ゲーム内では速度の制限が設定されているので、最高速度 s_max は a と 制限速度のうち小さい方とする。
        // 最高速度 s_max に達するのは v(n_max) > s_max のときなのでこれを n_max について整理すると
        //   (v1 - a) * p ^ (n_max - 1) + a > s_max
        //   n_max > log_p((s_max - a) * p / (v1 - a)
        // 現在位置は各tickごと速度v(n) だけ移動するので n tick 後の位置は
        //   ∑ v(k) {k = 1,n}
        //   = (v1 - a) * (p ^ n - 1) / (p - 1) + n * a
        // となる。ここにn_maxを代入すれば最高速度到達時の位置が求まる。

        const p = (1 - airResistance / weight * 1000);
        const q = (power * acc_mult - friction) / weight * p;
        const v1 = power * acc_mult / weight * p;
        const a = q / (1 - p); // 特性方程式(a は v(n+1) = v(n) のときの解)

        // 特性方程式の解(a)は到達可能な最高速度　a をそのまま使うとｎが求まらないので少し小さい値にする
        const maxSpeed = Math.min(a-0.0000001, limitSpeed);

        const maxn = Math.log((maxSpeed - a) * p / (v1 - a)) / Math.log(p);
        const distance = (v1 - a) * (Math.pow(p, maxn) - 1) / (p - 1) + maxn * a;

        // 制動距離計算
        // https://forums.factorio.com/viewtopic.php?t=60134 より
        // Braking distance (in tiles): max( ½ * weight * speed / (braking + friction), 1.1) * speed + 2

        const bd = Math.max(weight * maxSpeed / (breaking + friction) / 2, 1.1) * maxSpeed + 2;

        return {
            limitSpeed: limitSpeed,
            maxSpeed: maxSpeed,
            tick_reached_max: maxn,
            distance: distance,
            weight: weight,
            breaking_discance: bd
        }
    }
}

const CalcResult = (props) => {
    
    if (Number.isNaN(props.result)) {
        return <div>この構成では列車は動きません.</div>
    } else {
        const { limitSpeed, maxSpeed, tick_reached_max, distance, weight, breaking_discance} = props.result;
        return (
            <div>
                <table>
                    <tbody>                
                        <tr>
                            <th>最高速度</th>
                            <td>{maxSpeed * 60 * 60 * 60 / 1000} km/h</td>
                        </tr>
                        <tr>
                            <th>ゲーム内の制限速度</th>
                            <td>{limitSpeed * 60 * 60 * 60 / 1000} km/h</td>
                        </tr>
                        <tr>
                            <th>最高速度に到達する距離</th>
                            <td>{distance} m</td>
                        </tr>
                        <tr>
                            <th>レール換算</th>
                            <td>{ Math.ceil(distance / 2)} 個</td>
                        </tr>
                        <tr>
                            <th>最高速度到達時間</th>
                            <td>{tick_reached_max / 60 } 秒</td>
                        </tr>
                        <tr>
                            <th>最高速度時の制動距離</th>
                            <td>{breaking_discance} m</td>
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
}
