class TrainAppTest extends React.Component {
    
    render(){
        return (React.createElement("div", null, 
            React.createElement("span", null, "test1 ", this.test1() ? "成功" : "失敗"), React.createElement("br", null), 
            React.createElement("span", null, "test2 ", this.test2() ? "成功" : "失敗"), React.createElement("br", null), 
            React.createElement("span", null, "test3 ", this.test3() ? "成功" : "失敗"), React.createElement("br", null), 
            React.createElement("span", null, "test4 ", this.test4() ? "成功" : "失敗"), React.createElement("br", null)
        ));
        
        
        
    }

    test1(){
        let state = {
            fuel: 0,
            locomotive_active: 1,
            locomotive_inactive: 0,
            cargo_wagon: 0,
            artillery_wagon: 0,
            Leadertype: 0
        }

        return this.assert(state, 347);
    }

    test2(){
        let state = {
            fuel: 0,
            locomotive_active: 2,
            locomotive_inactive: 2,
            cargo_wagon: 2,
            artillery_wagon: 0,
            Leadertype: 0
        }

        return this.assert(state, 340);
    }

    test3(){
        let state = {
            fuel: 0,
            locomotive_active: 2,
            locomotive_inactive: 0,
            cargo_wagon: 1,
            artillery_wagon: 0,
            Leadertype: 2
        }

        return this.assert(state, 185);
    }

    test4(){
        let state = {
            fuel: 3,
            locomotive_active: 1,
            locomotive_inactive: 0,
            cargo_wagon: 9,
            artillery_wagon: 0,
            Leadertype: 0
        }

        return this.assert(state, 414);
    }

    assert(state, expect) {
        let trainapp = new TrainApp();
        trainapp.state = state;
        let {distance} = trainapp.calculate();
        let rail = Math.ceil(distance / 2);
        return expect == rail;
    }
}