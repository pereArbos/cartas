import React from 'react';
import PropTypes from 'prop-types';
import './App.css';

import Field from './game/field/Field';
import ImageArea from './game/imageArea/ImageArea';

export default class Main extends React.Component {
  static childContextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { imageName: null };
  }

  getChildContext() {
    return {
      parentState: this.state,
      updateParent: (data) => {
        this.setState(data);
      },
    };
  }

  render() {
    return (
      <div className="App-base">
        <span style={{ width: '22vw' }} className="mainBlock">
          <div style={{ display: 'block', height: '34vh' }}>hola</div>
          <ImageArea name={this.state.imageName} />
        </span>
        <span style={{ width: '56vw' }} className="mainBlock">
          <Field />
        </span>
      </div>
    );
  }
}
