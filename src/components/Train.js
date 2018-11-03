import defs from '../defines';

export default class Train {
    constructor() {
        this.vehicles = []; // 車両数        
        this.weight = 0; // 重量
        this.friction = 0; // 摩擦
        this.power = 0; // 動力
        this.braking = 0; // 制動力        
        this.fuel = 0;
        this.leader = 0;
        this.airResistance = 0;
        this.limitSpeed = 0;

        this.graph_step = 100;
        this.graph_datapoints = 10;
    }

    get CanMove() {
        return this.power > this.friction;
    }

    update(state) {
        this.fuel = defs.fuels[state.fuel];
        this.leader = state.leader;

        this.weight = 0;
        this.friction = 0;
        this.power = 0;
        this.braking = 0;

        defs.vehicles.forEach((v, i) => {
            const n = state[v.id];
            this.vehicles[i] = n;
            this.weight += v.weight * n;
            this.friction += v.friction_force * n;
            this.power += v.max_power * n;
            this.braking += v.braking_force * n;
        });

        this.power *= this.fuel.acc_mult;
        this.braking *= (state.braking_bonus + 1);
        this.airResistance = defs.vehicles[this.leader].air_resistance;
        this.limitSpeed = 1.2 * this.fuel.top_speed_mult;
    }

    calc() {
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

        const p = (1 - this.airResistance / this.weight * 1000);
        const v1 = this.power / this.weight * p;
        const q = v1 - this.friction / this.weight * p;
        const a = q / (1 - p);
        const ba = (this.braking + this.friction) / this.weight;

        // 時速の小数点２桁までで表示されない大きさの数値
        const err = 0.001 * 1000 / 60 / 60 / 60;

        // 特性方程式の解(a)は到達可能な最高速度　a をそのまま使うとｎが求まらないので少し小さい値にする
        const maxspd = Math.min(a - err, this.limitSpeed);

        const maxspd_tick = Math.ceil(this.calcAccelerationTick(maxspd, p, v1, a));
        const maxspd_distance = this.calcAccelerationDistance(maxspd_tick, p, v1, a);
        const maxspd_braking = this.calcBrakingDistance(maxspd, ba);
        const data = this.buildGraphData(p, v1, a, ba, maxspd, maxspd_tick, maxspd_distance, maxspd_braking);

        return { maxSpeed: this.gameSpd2kmph(maxspd), maxspd_distance, maxspd_time: this.tick2Seconds(maxspd_tick), maxspd_braking, graphData: data };
    }

    buildGraphData(p, v1, a, ba, mspd, mtick, mdistance, mbraking) {
        const data = [];
        let datapoints = 20;
        // 加速中のデータ
        for (let i = 0; i < datapoints; i++) {
            const t = Math.floor((i+1) * (mtick / datapoints));
            const spd = this.calcSpeed(t, p, v1, a);
            const ad = this.calcAccelerationDistance(t, p, v1, a)
            const bd = this.calcBrakingDistance(spd, ba);
            const bt = this.calcBrakingTick(spd, ba);
            data[i] = {
                ttl_dis: ad + bd,
                ttl_sec: this.tick2Seconds(t + bt),
                acc_sec: this.tick2Seconds(t),
                cru_sec: 0,
                brk_sec: this.tick2Seconds(bt),
                acc_dis: ad,
                cru_dis: 0,
                brk_dis: bd,
                maxspd: this.gameSpd2kmph(spd)
            }
        }

        const last = (mdistance + mbraking);
        const step = 50;
        const limit = Math.min(last * 3, 5000);
        const start = Math.ceil(last / step) * step;
        const template = data[data.length - 1];

        for (let j = start; j < limit; j += step) {
            const nb = Object.assign({}, template);
            nb.ttl_dis = j;
            nb.cru_dis = (j - last);
            nb.cru_sec = this.tick2Seconds(nb.cru_dis / mspd);
            nb.ttl_sec += nb.cru_sec;
            data.push(nb);
        }

        return data;

    }

    tick2Seconds(tick) {
        return tick / 60;
    }

    gameSpd2kmph(spd) {
        return spd * 60 * 60 * 60 / 1000;
    }

    fixFloat(v, fraction) {
        return Number.parseFloat(v.toFixed(fraction));
    }


    // 停止状態から速度spdに到達するまでのtick数を計算する
    calcAccelerationTick(spd, p, v1, a) {
        return Math.log((spd - a) * p / (v1 - a)) / Math.log(p);
    }

    // 停止状態から n tick 間加速し続けた場合の移動距離を計算する
    // 制限速度は考慮されない
    calcAccelerationDistance(n, p, v1, a) {
        return (v1 - a) * (Math.pow(p, n) - 1) / (p - 1) + n * a;
    }

    // 速度spd から停止までの移動距離を計算する
    calcBrakingDistance(spd, ba) {
        return Math.max(spd / ba / 2, 1.1) * spd;
    }

    // 速度spd から停止までのtick数を計算する
    calcBrakingTick(spd, ba) {
        return spd / ba;
    }

    // 停止状態から n tick 間加速し続けた場合の速度
    calcSpeed(n, p, v1, a) {
        return Math.min((v1 - a) * Math.pow(p, (n - 1)) + a, this.limitSpeed);
    }

    calcCruiseDistance(spd, n) {
        return spd * n;
    }
}