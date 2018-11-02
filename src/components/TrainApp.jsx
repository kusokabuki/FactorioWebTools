import React from 'react';

const FUELS = [
    { name: "石炭", acc_mult: 1, top_speed_mult: 1, img: "coal.png" },
    { name: "固形燃料", acc_mult: 1.2, top_speed_mult: 1.05, img: "solid-fuel.png" },
    { name: "ロケット燃料", acc_mult: 1.8, top_speed_mult: 1.15, img: "rocket-fuel.png" },
    { name: "核燃料", acc_mult: 2.5, top_speed_mult: 1.15, mg: "nuclear-fuel.png" },
];

const BREAK_BONUSES = [
    0, 0.1, 0.25, 0.40, 0.55, 0.70, 0.85, 1.00
];

const VEHICLES = [
    { id: "locomotive_active", name: "機関車（前向き）", min: 1, weight: 2000, max_speed: 1.2, max_power: 10, friction_force: 0.5, air_resistance: 0.0075, braking_force: 10, img: "locomotive.png" },
    { id: "locomotive_inactive", name: "機関車（後向き）", min: 0, weight: 2000, max_speed: 1.2, max_power: 0, friction_force: 0.5, air_resistance: 0.0075, braking_force: 10, img: "locomotive-r.png" },
    { id: "cargo_wagon", name: "貨物車両", min: 0, weight: 1000, max_speed: 1.5, max_power: 0, friction_force: 0.5, air_resistance: 0.01, braking_force: 3, img: "cargo.png" },
    { id: "artillery_wagon", name: "列車砲", min: 0, weight: 4000, max_speed: 1.5, max_power: 0, friction_force: 0.5, air_resistance: 0.015, braking_force: 3, img: "artillery.png" },
];

export default class TrainApp extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            fuel: 3,
            breaking_bonus: 1.00,
            locomotive_active: 1,
            locomotive_inactive: 0,
            cargo_wagon: 0,
            artillery_wagon: 0,
            leader: 0 // 先頭車両の種類
        }

        this.handleChangeInput = this.handleChangeInput.bind(this);
    }

    handleChangeInput(e) {
        const idx = e.target.idx;
        const veh = VEHICLES[idx];
        const obj = {};
        obj[veh.id] = e.target.value;
        this.setState(obj);
    }

    render() {
        const param = this.accumulateParams();

        return (
            <div>
                <p>
                    <label>燃料：</label>
                    <select
                        value={this.state.fuel}
                        onChange={e => this.setState({ fuel: e.target.value })}
                    >
                        {FUELS.map((f, i) =>
                            <option key={f.name} value={i}>{f.name}</option>
                        )}
                    </select>
                </p>
                <p>
                    <label>制動力ボーナス：</label>
                    <select
                        value={this.state.breaking_bonus}
                        onChange={e => this.setState({ breaking_bonus: Number.parseFloat(e.target.value) })}
                    >
                        {BREAK_BONUSES.map((f, i) =>
                            <option key={f} value={f}>{Math.round(f * 100)} %</option>
                        )}
                    </select>
                </p>
                <ul>
                    {VEHICLES.map((v, i) =>
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
                    {VEHICLES.map((v, i) =>
                        <span key={i}>
                            <input type="radio" value={i} checked={this.state.leader === i}
                                onChange={e => this.setState({ leader: i })} />{v.name}
                        </span>
                    )}
                </p>
                <hr></hr>
                <ParamView param={param}></ParamView>
                <ResultView param={param}></ResultView>
            </div>
        );
    }

    // 内部状態から計算用のパラメータを算出する
    accumulateParams() {
        const r = {
            vehicles: [], // 車両数
            fuel: FUELS[this.state.fuel],
            leader: this.state.leader,
            weight: 0, // 重量
            friction: 0, // 摩擦
            power: 0, // 動力
            breaking: 0, // 制動力
            airResistance: 0, // 空気抵抗
            limitSpeed: 0, // 制限速度
        };

        VEHICLES.forEach((v, i) => {
            let n = this.state[v.id];
            r.vehicles[i] = n;
            r.weight += v.weight * n;
            r.friction += v.friction_force * n;
            r.power += v.max_power * n;
            r.breaking += v.braking_force * (this.state.breaking_bonus + 1) * n;
        });

        r.airResistance = VEHICLES[this.state.leader].air_resistance;
        r.power *= r.fuel.acc_mult;
        r.limitSpeed = 1.2 * r.fuel.top_speed_mult;

        return r;
    }    
}

// 列車を編成する
const organizeTrain = (param) => {
    const varr = param.vehicles.concat();
    const formation = [];
    if (varr[param.leader] != 0) {
        formation.push(VEHICLES[param.leader].img);
        varr[param.leader]--;
    }
    for (let i = 0; i < varr.length; i++) {
        for (let j = 0; j < varr[i]; j++) {
            formation.push(VEHICLES[i].img);
        }
    }
    return formation.reverse();
}

const gameSpeed2kmph = (spd) => spd * 60 * 60 * 60 / 1000;

// パラメータから最高速度到達距離と所要tickを計算する
const calculateMaxspeedDistance = (param) => {

    // パワーが足りない場合
    if (param.power - param.friction <= 0) {
        return null;
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

    const p = (1 - param.airResistance / param.weight * 1000);
    const v1 = param.power / param.weight * p;
    const q = v1 - param.friction / param.weight * p;

    const a = q / (1 - p); // 特性方程式(a は v(n+1) = v(n) のときの解)

    // 特性方程式の解(a)は到達可能な最高速度　a をそのまま使うとｎが求まらないので少し小さい値にする
    const maxSpeed = Math.min(a - 0.0000001, param.limitSpeed);

    const maxn = Math.log((maxSpeed - a) * p / (v1 - a)) / Math.log(p);
    const distance = (v1 - a) * (Math.pow(p, maxn) - 1) / (p - 1) + maxn * a;

    return {
        maxSpeed: maxSpeed,
        ticks: maxn,
        distance: distance
    }
}

const calculateBreakingDistance = (param, speed) => {
    // 制動距離計算
    // https://forums.factorio.com/viewtopic.php?t=60134 より
    // Braking distance (in tiles): max( ½ * weight * speed / (braking + friction), 1.1) * speed + 2

    return Math.max(param.weight * speed / (param.breaking + param.friction) / 2, 1.1) * speed + 2;
}


const ParamView = (props) => {
    const param = props.param;
    const formation = organizeTrain(param);

    return (
        <div>
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
                        <td>{gameSpeed2kmph(param.limitSpeed)} km/h</td>
                        <td>{param.weight} kg</td>
                        <td>{param.power}</td>
                        <td>{param.friction}</td>
                        <td>{param.breaking}</td>
                        <td>{param.airResistance}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

const ResultView = (props) => {
    const r = calculateMaxspeedDistance(props.param);
    if (r === null) {
        return <div>この構成では列車は動きません.</div>
    } else {
        const b = calculateBreakingDistance(props.param, r.maxSpeed);
        return (
            <div>
                <h2>計算結果</h2>
                <table>
                    <thead>
                        <tr>
                            <th>最高速度</th>
                            <th>到達距離</th>
                            <th>到達時間</th>
                            <th>最高速度からの制動距離</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>                            
                            <td>{gameSpeed2kmph(r.maxSpeed).toFixed(4)} km/h</td>
                            <td>{r.distance.toFixed(4)} m</td>
                            <td>{(r.ticks / 60).toFixed(4)} 秒</td>
                            <td>{b.toFixed(4)} m</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
