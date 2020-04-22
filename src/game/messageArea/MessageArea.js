import React from 'react';
import PropTypes from 'prop-types';

import './MessageArea.css';

export default class MessageArea extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
  };

  render() {
    return (
      <div className="msgArea">
        <div className="msgTitle">Turno de Pere</div>
        <div className="msgContent">
          Pere usa muchas maids y se compra muchas{' '}
          <img
            alt="icon"
            src={require('../playerArea/iconFooter/icons/love.png')}
          ></img>{' '}
          cartas. Pere usa muchas maids y se compra muchas cartas.
        </div>
      </div>
    );
  }
}
