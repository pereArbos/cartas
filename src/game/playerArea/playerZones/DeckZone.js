import React from 'react';
import PropTypes from 'prop-types';

export default class DeckZone extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
  };

  render() {
    const { deck, discard } = this.context.parentState;
    const deckVisible = deck.length > 0 ? 'visible' : 'hidden';
    const discardTop = discard.length > 0 && discard[discard.length - 1];
    const { name, set } = discardTop || {};
    const route = set ? `set${set}/${name}` : name;

    return (
      <div className="DeckZone">
        <img
          alt="noseve"
          src={require('../../cards/cardback.jpg')}
          style={{ marginBottom: '1.5vh', visibility: deckVisible }}
        />
        {discardTop && (
          <img alt="noseve" src={require(`../../cards/${route}.jpg`)} />
        )}
      </div>
    );
  }
}
