import defs from '../defines';
import TravelingSummary from './TravelingSummary';

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

        this.topSpeed_summary = null; // 最高速度時のデータ
        this.graphData = null;
        this.graphAccDataPoints = 20;
    }

    get CanMove() {
        return this.power > this.friction;
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
        this.acc_brake = (this.braking + this.friction) / this.weight;
        this.airResistance = defs.vehicles[this.leader].air_resistance;
        this.limitSpeed = 1.2 * this.fuel.top_speed_mult;
        this.graphData = null;
        this.update();
    }

    update() {
        // 動力、摩擦、空気抵抗が影響する区間の計算に必要なパラメータの用意
        this.p = (1 - this.airResistance / this.weight * 1000);
        this.q = (this.power - this.friction) / this.weight * this.p;
        this.a = this.q / (1 - this.p);

        this.v1 = this.calcInitialSpeed();

        // 特性方程式の解(a)は到達可能な最高速度　a をそのまま使うとｎが求まらないので少し小さい値にする
        // 時速の小数点２桁までで表示されない大きさの数値
        const err = 0.001 * 1000 / 60 / 60 / 60;
        this.topSpeed = Math.min(this.a - err, this.limitSpeed);
        this.topSpeed_tick = this.calcAccelerationTick(this.topSpeed);
        this.topSpeed_summary = this.makeSummary(this.topSpeed_tick);
    }

    // 初速
    // エンジン加速より摩擦減速が先に計算されているっぽくて、１回目は摩擦なし
    // 発射時のみ２回分の加速？
    calcInitialSpeed() {
        const acc_engine = this.power / this.weight;
        const acc_friction = -this.friction / this.weight;
        let speed = acc_engine * this.p;
        speed = (speed + acc_engine + acc_friction) * this.p; 
        return speed;
    }

    // 停止状態から速度spdに到達するまでのtick数を計算する
    // 制限速度は考慮されない
    calcAccelerationTick(spd) {
        if (this.p === 1) { // 摩擦なしの場合
            return Math.ceil((spd - this.v1) / this.q);
        } else {
            return Math.ceil(Math.log((spd - this.a) * this.p / (this.v1 - this.a)) / Math.log(this.p));    
        }
    }

    // 停止状態から n tick 間加速し続けた場合の移動距離を計算する
    // 制限速度は考慮されない
    calcAccelerationDistance(tick) {
        if (this.p === 1) {
            return tick * this.calcSpeed(tick) / 2;
        } else {
            return (this.v1 - this.a) * (Math.pow(this.p, tick) - 1) / (this.p - 1) + tick * this.a;
        }
    }

    // 停止状態から n tick 間加速し続けた場合の速度
    calcSpeed(tick) {
        if (this.topSpeed_tick <= tick) {
            return this.topSpeed;
        }

        if (this.p === 1) {
            return Math.min(this.q * tick, this.limitSpeed) + this.v1;
        } else {
            return Math.min((this.v1 - this.a) * Math.pow(this.p, tick) + this.a, this.limitSpeed);
        }
        
    }

    // 速度spd から停止までの移動距離を計算する
    calcBrakingDistance(spd) {
        return Math.max(spd / this.acc_brake / 2, 1.1) * spd;
    }

    // 速度spd から停止までのtick数を計算する
    calcBrakingTick(spd) {
        return Math.ceil(spd / this.acc_brake);
    }

    buildGraphData() {
        const data = [];
        const dps = this.graphAccDataPoints;
        const ttl_dis = this.topSpeed_summary.ttl_dis;

        // 加速中のデータ
        for (let i = 0; i < dps; i++) {
            const t = Math.floor((i + 1) * (this.topSpeed_tick / dps));
            data[i] = this.makeSummary(t);
        }

        // 最高速度に到達後のデータ
        // 加速区間と減速区間は一定なので、最高速度での走行距離と時間を求めれば良い
        const step = 50;
        const limit = Math.min(ttl_dis * 3, 5000);
        const start = Math.ceil(ttl_dis / step) * step;
        const template = data[data.length - 1];

        for (let j = start; j < limit; j += step) {
            const nb = Object.create(template);
            nb.cru_dis = (j - ttl_dis);
            nb.cru_tick = Math.ceil(nb.cru_dis / this.topSpeed);
            data.push(nb);
        }

        return data;
    }   

    // 距離distanceの運行時間を計算する
    calcEta(distance) {
        const ttl_dis = this.topSpeed_summary.ttl_dis;
        this.eta_trycount = 0;
        if (Number.isNaN(distance) || distance <= 0) {
            return null;
        } else if (distance < ttl_dis) {
            let left = 0;
            let right = this.topSpeed_tick;

            // グラフ用のデータを流用して大体の位置を決める
            if (this.graphData !== null) {
                for(let i = 1; i < this.graphAccDataPoints; i++) {
                    const g = this.graphData[i];
                    if (distance == g.ttl_dis) {
                        return g;
                    } else if (distance < g.ttl_dis) {
                        left = this.graphData[i-1].acc_tick;
                        right = g.acc_tick;
                        break;
                    }
                }
            }

            let result = null;
            while (left <= right) {
                this.eta_trycount++;
                let mid = Math.floor((left + right) / 2);
                let v1 = this.makeSummary(mid);
                let v2 = this.makeSummary(mid + 1);

                if (v1.ttl_dis < distance && distance <= v2.ttl_dis) {
                    result = v2;
                    break;
                }
                if (v2.ttl_dis < distance) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
                if (30 < this.eta_trycount) break;
            }
            return result;
        } else {
            const ct = Math.ceil((distance - ttl_dis) / this.topSpeed);
            return this.makeSummary(this.topSpeed_tick + ct);
        }
    }

    makeSummary(acc_tick) {
        const sum = new TravelingSummary();
        if (this.topSpeed_tick <= acc_tick) {
            sum.acc_tick = this.topSpeed_tick;
            sum.acc_dis = this.calcAccelerationDistance(acc_tick);
            sum.cru_tick = acc_tick - this.topSpeed_tick;
            sum.cru_dis = this.topSpeed * sum.cru_tick;
            sum.topSpeed = this.topSpeed;
        } else {
            sum.acc_tick = acc_tick;
            sum.acc_dis = this.calcAccelerationDistance(acc_tick);
            sum.cru_tick = 0;
            sum.cru_dis = 0;
            sum.topSpeed = this.calcSpeed(acc_tick);
        }

        sum.brk_tick = this.calcBrakingTick(sum.topSpeed);
        sum.brk_dis = this.calcBrakingDistance(sum.topSpeed);
        return sum;
    }

    gameSpd2kmph(spd) {
        return spd * 60 * 60 * 60 / 1000;
    }
}