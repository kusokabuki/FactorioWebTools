
import defs from '../defines';

/**
 * 列車の運行概要を表すクラス
 * 加速区間、巡航区間、減速区間のそれぞれの所要時間、走行距離を保持する
 */
export default class TravelingSummary {
    constructor() {
        this.acc_tick = 0;
        this.acc_dis = 0;
        this.cru_tick = 0;
        this.cru_dis = 0;
        this.topSpeed = 0;
        this.brk_tick = 0;
        this.brk_dis = 0;
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

    get ttl_tick() {
        return this.acc_tick + this.cru_tick + this.brk_tick;
    }

    get ttl_sec() {
        return this.tick2Seconds(this.ttl_tick);
    }

    get ttl_dis() {
        return this.acc_dis + this.cru_dis + this.brk_dis;
    }

    get top_spd() {
        return this.gameSpd2kmph(this.topSpeed);
    }

    get fuel_consumed_joule() {
        return (this.acc_tick + this.cru_tick) * defs.locomotive_power_watt / 60;
    }

    tick2Seconds(tick) {
        return tick / 60;
    }

    gameSpd2kmph(spd) {
        return spd * 60 * 60 * 60 / 1000;
    }
}