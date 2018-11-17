import React from 'react';
import defs from '../../src/defines';

import Train from '../../src/models/Train';

export default class TrainValidator {
    constructor() {

        this.train = new Train();
        this.tests = this.buildTests();
        this.data = null;
        this.currentTestIndex = 0;
    }

    buildTests() {
        const c1l2c2a1b1_state = {
            fuel: 3,
            braking_bonus: 1.00,
            locomotive_active: 2,
            locomotive_inactive: 0,
            cargo_wagon: 3,
            artillery_wagon: 1,
            leader: 2
        }

        const l1b1_state = {
            fuel: 3,
            braking_bonus: 1.00,
            locomotive_active: 1,
            locomotive_inactive: 0,
            cargo_wagon: 0,
            artillery_wagon: 0,
            leader: 0
        }

        return [
            {
                name: "various_50",
                state: c1l2c2a1b1_state,
                file: "data/c1l2c2a1b1/50.txt",
                distance: 50
            },
            {
                name: "various_100",
                state: c1l2c2a1b1_state,
                file: "data/c1l2c2a1b1/100.txt",
                distance: 100
            },
            {
                name: "various_550",
                state: c1l2c2a1b1_state,
                file: "data/c1l2c2a1b1/550.txt",
                distance: 550
            },
            {
                name: "uni_50",
                state: l1b1_state,
                file: "data/l1b1/50.txt",
                distance: 50
            },
            {
                name: "uni_100",
                state: l1b1_state,
                file: "data/l1b1/100.txt",
                distance: 100
            },
            {
                name: "uni_200",
                state: l1b1_state,
                file: "data/l1b1/200.txt",
                distance: 200
            },
            {
                name: "uni_1000",
                state: l1b1_state,
                file: "data/l1b1/1000.txt",
                distance: 1000
            },
        ];
    }

    loadData(testIndex) {
        this.currentTestIndex = testIndex;
        const test = this.tests[testIndex];
        this.train.setState(test.state);

        return fetch("../" + test.file)
            .then(res => res.text())
            .then(text => {
                console.log(text);
                this.parseData(text);
            });
    }

    parseData(text) {
        this.data = ["dammy"];
    }
}