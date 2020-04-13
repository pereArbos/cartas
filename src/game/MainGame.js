import React from 'react';
import PropTypes from 'prop-types';

import Field from './field/Field';
import ImageArea from './imageArea/ImageArea';
import MainPlayer from './playerArea/MainPlayer';

export default class MainGame extends React.Component {
  static childContextTypes = {
    updateImage: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { imageName: null };
  }

  getChildContext() {
    return {
      updateImage: (imageName) => {
        this.setState({ imageName });
      },
    };
  }

  render() {
    return (
      <div className="App-base">
        <span style={{ width: '22vw' }} className="mainBlock">
          <div style={{ display: 'block', height: '34vh' }}>
            {this.props.payload || 'hola'}
          </div>
          <ImageArea name={this.state.imageName} />
        </span>
        <span style={{ width: '56vw' }} className="mainBlock">
          <Field />
          <MainPlayer />
        </span>
      </div>
    );
  }
}
