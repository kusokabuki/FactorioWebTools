import React from "react";
import TestSelectorForm from "./TestSelectorForm.jsx";
import DataView from "./DataView.jsx";
import TrainValidator from "../models/TrainValidator";

export default class TrainTestApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTest: 0,
            isLoaded: false
        };
        this.validator = new TrainValidator();
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    handleOnChange(name, value) {
        const obj = {};
        obj[name] = value;
        this.setState(obj);
    }

    render() {
        return (
            <div>
                <h1>train test app</h1>
                <TestSelectorForm
                    tests={this.validator.tests}
                    selectedTest={this.state.selectedTest}
                    onChange={this.handleOnChange} />
                <DataView isLoaded={this.state.isLoaded} data={this.validator.data} header={this.validator.header} />
            </div>
        );
    }

    async componentDidMount() {
        await this.validator.fetchData(this.state.selectedTest);
        this.setState({ isLoaded: true });
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.state.selectedTest !== prevState.selectedTest) {
            await this.validator.fetchData(this.state.selectedTest);
            this.setState({ isLoaded: true });
        }
    }
}