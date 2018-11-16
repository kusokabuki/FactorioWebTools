
/**
 * 列車の運行概要を表すクラス
 * 加速区間、巡航区間、減速区間のそれぞれの所要時間、走行距離を保持する
 */
export default class TravelingSummary {
    constructor(train, acc_tick) {
        if (train.maxspd_tick <= acc_tick) {
            this.acc_tick = train.maxspd_tick;
            this.acc_dis = train.maxspd_distance;
            this.cru_tick = acc_tick - train.maxspd_tick;
            this.cru_dis = train.maxspd * this.cru_tick;
            this.topSpeed = train.maxspd;
        } else {
            this.acc_tick = acc_tick;
            this.acc_dis = train.calcAccelerationDistance(acc_tick);
            this.cru_tick = 0;
            this.cru_dis = 0;
            this.topSpeed = train.calcSpeed(acc_tick);
        }

        this.brk_tick = train.calcBrakingTick(this.topSpeed);
        this.brk_dis = train.calcBrakingDistance(this.topSpeed);
        this.train = train;
    }

    get acc_sec() {
        return this.tick2Seconds(this.acc_tick);
    }

    get cru_sec() {
        return this.tick2Seconds(this.cru_tick);
    }

    get brk_sec() {
        return this.tick2Seconds(this.brk_tick);
    }

    get ttl_sec() {
        return this.tick2Seconds(this.acc_tick + this.cru_tick + this.brk_tick);
    }

    get ttl_dis() {
        return this.acc_dis + this.cru_dis + this.brk_dis;
    }

    get top_spd() {
        return this.gameSpd2kmph(this.topSpeed);
    }

    get fuel_consumed_joule() {
        return this.train.calcFuelConsumed(this.acc_tick + this.cru_tick);
    }

    get fuel_consumed_rate() {
        return this.fuel_consumed_joule / this.train.fuel.fuel_value;
    }

    tick2Seconds(tick) {
        return tick / 60;
    }

    gameSpd2kmph(spd) {
        return spd * 60 * 60 * 60 / 1000;
    }
}