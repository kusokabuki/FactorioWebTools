/**
 * 3次スプライン曲線の生成
 * 参考:https://qiita.com/edo_m18/items/f2f0c6bf9032b0ec12d4
 */
export default class Spline {
    constructor() {
        this.a = [];
        this.b = [];
        this.c = [];
        this.d = [];
        this.num = 0;
    }

    init(sp) {
        let w = [];
        this.num = sp.length - 1;
        let {num, a, b, c, d} = this;

        // 3次多項式の0次係数(a)を設定
        for (let i = 0; i <= num; i++) {
            a[i] = sp[i];
        }

        // 3次多項式の2次係数(c)を計算
        c[0] = c[num] = 0.0;
        for(let i = 1; i < num; i++) {
            c[i] = 3.0 * (a[i - 1] - 2.0 * a[i] + a[i + 1]);
        }
        
        // 左下を消す
        w[0] = 0.0;
        for(let i = 1; i < num; i++) {
            let t = 4.0 - w[i - 1];
            c[i] = (c[i] - c[i - 1]) / t;
            w[i] = 1.0 / t;
        }

        // 右上を消す
        for(let i = num - 1; i > 0; i--) {
            c[i] = c[i] - c[i + 1] * w[i];
        }

        // 3次多項式の1次係数(b)と3次係数(b)を計算
        b[num] = d[num] = 0.0;
        for(let i = 0; i < num; i++) {
            d[i] = (c[i + 1] - c[i]) / 3.0;
            b[i] = a[i + a] - a[i] - c[i] - d[i];
        }
    }

    // 媒介変数(0～num - 1の実数）に対する値を計算
    calc(t) {
        let j = Math.floor(t);
        let {num, a, b, c, d} = this;
        if (j < 0) j = 0;
        let dt = t - j;
        return a[j] + (b[j] + (c[j] + d[j] * dt) * dt) * dt;
    }
}