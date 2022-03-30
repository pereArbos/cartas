import React from "react";

import MatrixFiller from "./views/MatrixFiller";
import Step1 from "./views/Step1";

import "./App.css";

const steps = [MatrixFiller, Step1];

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 0 };
  }

  nextStep = (data) => {
    this.setState((prevState) => {
      return { ...data, step: prevState.step + 1 };
    });
  };

  render() {
    const StepCmp = steps[this.state.step];
    return (
      <div className="App-base">
        <StepCmp next={this.nextStep} {...this.state} />
      </div>
    );
  }
}
