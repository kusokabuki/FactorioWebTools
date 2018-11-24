import Train from '../../src/models/Train';
import TestParams from "./TestParams";

export default class TrainValidator {
    constructor() {
        this.train = new Train();
        this.tests = TestParams;
        this.testResult = null;
        this.currentTestIndex = 0;
        this.header = [
            "tick",
            "sim_speed",
            "test_speed",
            "dif_speed",
            "sim_distance",
            "test_distance",
            "dif_distance",
        ];
    }

    async startTest(testIndex) {
        this.currentTestIndex = testIndex;
        const test = this.tests[testIndex];
        this.train.setState(test.state);

        const testdata = await this.fetchData("../" + test.file);
        const simdata = this.simulateTrain();

        this.testResult = this.compareTestdataToSimulation(testdata, simdata);
    }

    async fetchData(filePath) {
        const res = await fetch(filePath);
        const text = await res.text();
        return this.parseCSV(text);
    }

    parseCSV(text) {
        let data = [];
        let lines = text.split(/\n\r?/);
        const csvsplitter = /,\s*/;
        const header = lines[0].split(csvsplitter);
        for (let i = 1; i < lines.length; i++) {
            if (0 < lines[i].length) {
                const vals = lines[i]
                    .split(csvsplitter)
                    .map(parseFloat);
                let d = {};
                for (let j = 0; j < vals.length; j++) {
                    d[header[j]] = vals[j];
                }
                data.push(d);
            }

        }
        return data;
    }

    simulateTrain() {
        const test = this.tests[this.currentTestIndex];
        const eta = this.train.calcEta(test.distance);
        const result = [{
            tick: 0,
            speed: 0,
            distance: 0
        }];
        let ttl_d = 0;
        let spd = 0;
        for (let t = 0; t < eta.ttl_tick; t++) {
            if (t <= eta.acc_tick) {
                spd = this.train.calcSpeed(t);
            } else if (eta.acc_tick + eta.cru_tick < t) {
                spd -= this.train.ba;
            }
            ttl_d += spd;
            result[t + 1] = {
                tick: t + 1,
                speed: spd,
                distance: ttl_d
            }
        }
        return result;
    }

    compareTestdataToSimulation(testdata, simdata) {
        const size = Math.max(simdata.length, testdata.length);
        const result = [];

        for (let i = 0; i < size; i++) {
            const r = { tick: i };
            if (i < simdata.length) {
                r.sim_speed = simdata[i].speed;
                r.sim_distance = simdata[i].distance;
            } else {
                r.sim_speed = 0;
                r.sim_distance = 0;
            }

            if (i < testdata.length) {
                r.test_speed = testdata[i].speed;
                r.test_distance = testdata[i].distance;
            } else {
                r.test_speed = 0;
                r.test_distance = 0;
            }
            r.dif_speed = r.sim_speed - r.test_speed;
            r.dif_distance = r.sim_distance - r.test_distance;
            result[i] = r;
        }
        return result;
    }

}