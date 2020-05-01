import React from 'react';
import PropTypes from 'prop-types';

import './MessageArea.css';

export default class MessageArea extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
  };

  getMessage = () => {
    return this.context.parentState.message.split('&').map((item, idx) => {
      if (idx % 2 === 0) return item;
      return (
        <img
          alt="icon"
          src={require(`../playerArea/iconFooter/icons/${item}.png`)}
        ></img>
      );
    });
  };

  render() {
    return (
      <div className="msgArea">
        <div className="msgTitle">{this.context.parentState.msgTitle}</div>
        <div className="msgContent">{this.getMessage()}</div>
      </div>
    );
  }
}
