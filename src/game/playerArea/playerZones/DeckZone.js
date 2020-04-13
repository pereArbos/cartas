import React from 'react';
import PropTypes from 'prop-types';

export default class DeckZone extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
  };

  componentDidUpdate() {
    console.log(this.context.parentState.deck);
  }

  render() {
    return (
      <div className="DeckZone">
        <img
          alt="noseve"
          src={require('../../cards/cardback.jpg')}
          style={{ marginBottom: '1.5vh' }}
        />
        <img alt="noseve" src={require('../../cards/cardback.jpg')} />
      </div>
    );
  }
}
