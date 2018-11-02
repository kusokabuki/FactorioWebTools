import React from 'react';
import defs from '../defines';

import TrainInputForm from './TrainInputForm.jsx';
import StatusView from './TrainStatusView.jsx';
import ResultView from './ResultView.jsx';

export default class TrainApp extends React.Component {
    constructor(props) {
        super(props);

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

    render() {
        const train = this.fetchTrainInfo();
        const result = this.calculateMaxspeedDistance(train);
        result.breakingDistance = this.calculateBreakingDistance(train, result.maxSpeed);
        return (
            <div>
                <TrainInputForm state={this.state} changeHandler={this.handleChangeInput} />
                <hr></hr>
                <StatusView train={train}></StatusView>
                <ResultView train={train} result={result}></ResultView>
            </div>
        );
    }

    handleChangeInput(name, value) {
        const obj = {};
        obj[name] = value;
        this.setState(obj);        
    }    

    // 内部状態から計算用のパラメータを算出する
    fetchTrainInfo() {
        const r = {
            vehicles: [], // 車両数
            fuel: defs.fuels[this.state.fuel],
            leader: this.state.leader,
            weight: 0, // 重量
            friction: 0, // 摩擦
            power: 0, // 動力
            breaking: 0, // 制動力
            airResistance: 0, // 空気抵抗
            limitSpeed: 0, // 制限速度
        };

        defs.vehicles.forEach((v, i) => {
            let n = this.state[v.id];
            r.vehicles[i] = n;
            r.weight += v.weight * n;
            r.friction += v.friction_force * n;
            r.power += v.max_power * n;
            r.breaking += v.braking_force * (this.state.breaking_bonus + 1) * n;
        });

        r.airResistance = defs.vehicles[this.state.leader].air_resistance;
        r.power *= r.fuel.acc_mult;
        r.limitSpeed = 1.2 * r.fuel.top_speed_mult;

        return r;
    }    
    
    // パラメータから最高速度到達距離と所要tickを計算する
    calculateMaxspeedDistance(train) {

        // パワーが足りない場合
        if (train.power - train.friction <= 0) {
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

        const p = (1 - train.airResistance / train.weight * 1000);
        const v1 = train.power / train.weight * p;
        const q = v1 - train.friction / train.weight * p;

        const a = q / (1 - p); // 特性方程式(a は v(n+1) = v(n) のときの解)

        // 画面に生じされない
        const err = 0.001 * 1000 / 60 / 60 / 60;

        // 特性方程式の解(a)は到達可能な最高速度　a をそのまま使うとｎが求まらないので少し小さい値にする
        const maxSpeed = Math.min(a - err, train.limitSpeed);

        const maxn = Math.log((maxSpeed - a) * p / (v1 - a)) / Math.log(p);
        const distance = (v1 - a) * (Math.pow(p, maxn) - 1) / (p - 1) + maxn * a;

        return {
            maxSpeed: maxSpeed,
            ticks: maxn,
            distance: distance
        }
    }

    calculateBreakingDistance(train, speed) {
        // 制動距離計算
        // https://forums.factorio.com/viewtopic.php?t=60134 より
        // Braking distance (in tiles): max( ½ * weight * speed / (braking + friction), 1.1) * speed + 2

        return Math.max(train.weight * speed / (train.breaking + train.friction) / 2, 1.1) * speed + 2;
    }
}

