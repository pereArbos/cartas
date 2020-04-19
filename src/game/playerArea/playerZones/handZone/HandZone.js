import React from 'react';
import PropTypes from 'prop-types';

import { config } from './playerActions';

export default class HandZone extends React.Component {
  static contextTypes = {
    playerState: PropTypes.object,
    updateImage: PropTypes.func,
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
    updatePlayer: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { message: '' };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const oldState = this.context.parentState.gameState;
    const newState = nextContext.parentState.gameState;
    if (oldState !== newState && config[newState]) {
      this.setState({
        message: '',
        button1Text: null,
        button2Text: null,
        ...config[newState],
      });
    }
  }

  button1 = () => this.state.button1Click(this.context);
  button2 = () => this.state.button2Click(this.context);

  render() {
    const { hand } = this.context.playerState;
    const { message, button1Text, button1Click } = this.state;
    const { button2Text, button2Click } = this.state;

    return (
      <div className="HandZone">
        <h6>{message}</h6>
        <div className="handCards">
          {hand.map((card, idx, list) => {
            const { name, set } = card;
            const route = set ? `set${set}/${name}` : name;
            return (
              <img
                alt="noseve"
                src={require(`../../../cards/${route}.jpg`)}
                onMouseOver={() => {
                  this.context.updateImage(route);
                }}
                onMouseOut={() => {
                  this.context.updateImage(null);
                }}
                style={{
                  left: `${8.8 + 1.4 * idx - 0.7 * list.length}vw`,
                  zIndex: list.length - idx,
                }}
              />
            );
          })}
        </div>
        {button1Text && button1Click && (
          <button type="button" style={{ left: '5px' }} onClick={this.button1}>
            {button1Text}
          </button>
        )}
        {button2Text && button2Click && (
          <button type="button" style={{ right: '5px' }} onClick={this.button2}>
            {button2Text}
          </button>
        )}
      </div>
    );
  }
}
