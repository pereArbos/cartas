import React from 'react';
import PropTypes from 'prop-types';

import CardDisplayModal from '../../cardDisplayModal/CardDisplayModal';

export default class DeckZone extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { showModal: false };
  }

  hideModal = () => this.setState({ showModal: false });
  showModal = () => this.setState({ showModal: true });

  render() {
    const { deck, discard } = this.context.parentState;
    const deckVisible = deck.length > 0 ? 'visible' : 'hidden';
    const discardTop = discard.length > 0 && discard[discard.length - 1];
    const { name, set } = discardTop || {};
    const route = set ? `set${set}/${name}` : name;

    return [
      <div className="DeckZone">
        <img
          alt="noseve"
          src={require('../../cards/cardback.jpg')}
          title="Tu Mazo"
          style={{ marginBottom: '1.5vh', visibility: deckVisible }}
        />
        {discardTop && (
          <img
            alt="noseve"
            className="showesModal"
            title="Tus Descartes"
            onClick={this.showModal}
            src={require(`../../cards/${route}.jpg`)}
          />
        )}
      </div>,
      <CardDisplayModal
        background="rgba(255, 153, 153, 0.9)"
        showModal={this.state.showModal}
        hideModal={this.hideModal}
        cards={discard}
      />,
    ];
  }
}
