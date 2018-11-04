import defs from '../defines';

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

        this.graphData = null;
    }

    get CanMove() {
        return this.power > this.friction;
    }

    get MaxSpeedInfo() {
        return {
            spd: this.gameSpd2kmph(this.maxspd),
            dis: this.maxspd_distance,
            sec: this.tick2Seconds(this.maxspd_tick),
            brk: this.maxspd_braking_distance
        }
    }

    get GraphData() {
        if (this.graphData == null) {
            this.graphData = this.buildGraphData();
        }
        return this.graphData;
    }

    setState(state) {
        this.fuel = defs.fuels[state.fuel];
        this.leader = state.leader;

        this.weight = 0;
        this.friction = 0;
        this.power = 0;
        this.braking = 0;

        defs.vehicles.forEach((v, i) => {
            let n = state[v.id];
            if (Number.isNaN(n)) n = 0;
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
        this.update();
    }

    update() {
        this.p = (1 - this.airResistance / this.weight * 1000);
        this.v1 = this.power / this.weight * this.p;
        this.q = this.v1 - this.friction / this.weight * this.p;
        this.a = this.q / (1 - this.p);
        this.ba = (this.braking + this.friction) / this.weight;

        // 時速の小数点２桁までで表示されない大きさの数値
        const err = 0.001 * 1000 / 60 / 60 / 60;

        // 特性方程式の解(a)は到達可能な最高速度　a をそのまま使うとｎが求まらないので少し小さい値にする
        this.maxspd = Math.min(this.a - err, this.limitSpeed);
        this.maxspd_tick = Math.ceil(this.calcAccelerationTick(this.maxspd));
        this.maxspd_distance = this.calcAccelerationDistance(this.maxspd_tick);
        this.maxspd_braking_distance = this.calcBrakingDistance(this.maxspd);
        this.maxspd_total_distance = this.maxspd_distance + this.maxspd_braking_distance;

        this.graphData = null;
    }

    buildGraphData() {
        const data = [];
        const datapoints = 20;
        // 加速中のデータ
        for (let i = 0; i < datapoints; i++) {
            const t = Math.floor((i + 1) * (this.maxspd_tick / datapoints));
            const spd = this.calcSpeed(t);
            const ad = this.calcAccelerationDistance(t)
            const bd = this.calcBrakingDistance(spd);
            const bt = this.calcBrakingTick(spd);
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

        // 最高速度に到達後のデータ
        // 加速区間と減速区間は一定なので、最高速度での走行距離と時間を求めれば良い
        const step = 50;
        const limit = Math.min(this.maxspd_total_distance * 3, 5000);
        const start = Math.ceil(this.maxspd_total_distance / step) * step;
        const template = data[data.length - 1];

        for (let j = start; j < limit; j += step) {
            const nb = Object.assign({}, template);
            nb.ttl_dis = j;
            nb.cru_dis = (j - this.maxspd_total_distance);
            nb.cru_sec = this.tick2Seconds(nb.cru_dis / this.maxspd);
            nb.ttl_sec += nb.cru_sec;
            data.push(nb);
        }

        return data;
    }

    // 距離distanceの運行時間を計算する
    calcEta(distance) {
        if (Number.isNaN(distance)) {
            return NaN;
        } else if (distance < this.maxspd_total_distance) {
            // 減速距離=運行距離/2と仮定して最高速度を見積もる
            const spd_estimate = Math.sqrt(this.ba * distance)
            let acc_tick = Math.ceil(this.calcAccelerationTick(spd_estimate));
            let cur = this.calcRunningFromAccTick(acc_tick);
            let next = this.calcRunningFromAccTick(acc_tick + 1);
            let try_count = 1;
            while(!(cur.dis < distance && distance <= next.dis)){
                if (next.dis < distance){
                    cur = next;
                    next = this.calcRunningFromAccTick(++acc_tick)
                } else {
                    next = cur;
                    cur = this.calcRunningFromAccTick(--acc_tick);
                }
                try_count++;
            }
            const fc = this.calcFuelConsumed(next.acc_tick);
            return {
                ttl_sec: this.tick2Seconds(next.acc_tick + next.brk_tick),
                acc_sec: this.tick2Seconds(next.acc_tick),
                cru_sec: 0,
                brk_sec: this.tick2Seconds(next.brk_tick),
                maxspd: this.gameSpd2kmph(this.calcSpeed(next.acc_tick)),
                fuel_consumed_joule: fc,
                fuel_consumed_rate: fc / this.fuel.fuel_value,
                try_count
            }
        } else {
            const t = this.maxspd_tick;
            const ct = (distance - this.maxspd_total_distance) / this.maxspd;
            const bt = this.calcBrakingTick(this.maxspd);
            const fc = this.calcFuelConsumed(t + ct);
            return {
                ttl_sec: this.tick2Seconds(t + bt + ct),
                acc_sec: this.tick2Seconds(t),
                cru_sec: this.tick2Seconds(ct),
                brk_sec: this.tick2Seconds(bt),
                maxspd: this.gameSpd2kmph(this.maxspd),
                fuel_consumed_joule: fc,
                fuel_consumed_rate: fc / this.fuel.fuel_value,
                try_count:0
            }
        }
    }

    tick2Seconds(tick) {
        return tick / 60;
    }

    gameSpd2kmph(spd) {
        return spd * 60 * 60 * 60 / 1000;
    }

    // 停止状態から速度spdに到達するまでのtick数を計算する
    // 制限速度は考慮されない
    calcAccelerationTick(spd) {
        return Math.log((spd - this.a) * this.p / (this.v1 - this.a)) / Math.log(this.p);
    }

    // 停止状態から n tick 間加速し続けた場合の移動距離を計算する
    // 制限速度は考慮されない
    calcAccelerationDistance(tick) {
        return (this.v1 - this.a) * (Math.pow(this.p, tick) - 1) / (this.p - 1) + tick * this.a;
    }

    // 速度spd から停止までの移動距離を計算する
    calcBrakingDistance(spd) {
        return Math.max(spd / this.ba / 2, 1.1) * spd;
    }

    // 速度spd から停止までのtick数を計算する
    calcBrakingTick(spd) {
        return spd / this.ba;
    }

    // 停止状態から n tick 間加速し続けた場合の速度
    calcSpeed(tick) {
        return Math.min((this.v1 - this.a) * Math.pow(this.p, (tick - 1)) + this.a, this.limitSpeed);
    }

    // エンジン稼働時間から燃料消費量を求める
    calcFuelConsumed(tick) {
        return defs.locomotive_power_watt * tick / 60;
    }

    // 加速時間から走行距離と時間を計算する
    calcRunningFromAccTick(acc_tick) {
        const spd = this.calcSpeed(acc_tick);
        const ad = this.calcAccelerationDistance(acc_tick)
        const bd = this.calcBrakingDistance(spd);
        const bt = this.calcBrakingTick(spd);
        
        return { dis: ad + bd, acc_tick, brk_tick: bt };
    }

}