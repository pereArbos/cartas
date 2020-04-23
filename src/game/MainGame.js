import React from 'react';
import PropTypes from 'prop-types';

import Field from './field/Field';
import MessageArea from './messageArea/MessageArea';
import ImageArea from './imageArea/ImageArea';
import MainPlayer from './playerArea/MainPlayer';
import OppZones from './playerArea/OppZones';

export default class MainGame extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
  };

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
    const { opponents = [] } = this.context.parentState;

    return (
      <div className="App-base">
        <span style={{ width: '22vw' }} className="mainBlock">
          <MessageArea />
          <ImageArea name={this.state.imageName} />
        </span>
        <span style={{ width: '56vw' }} className="mainBlock">
          <Field />
          <MainPlayer />
        </span>
        <span style={{ width: '22vw' }} className="mainBlock">
          {opponents.map((foo, idx) => {
            if (idx >= 3) return null;
            return <OppZones oppIdx={idx} />;
          })}
        </span>
      </div>
    );
  }
}
