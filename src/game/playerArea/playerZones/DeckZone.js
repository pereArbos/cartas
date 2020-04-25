import React from 'react';
import PropTypes from 'prop-types';

import CardDisplayModal from '../../cardDisplayModal/CardDisplayModal';

export default class DeckZone extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  hideModal = () => this.setState({ show: false });
  showModal = () => this.setState({ show: true });

  render() {
    const { opponents } = this.context.parentState;
    const { oppName, oppIdx } = this.props;

    const { discard, deck } = oppName
      ? opponents[oppIdx].data
      : this.context.parentState;
    const deckLength = deck && deck.length;

    const deckVisible = deckLength === 0 ? 'hidden' : 'visible';
    const discardTop = discard.length > 0 && discard[discard.length - 1];
    const { name, set } = discardTop || {};
    const route = set ? `set${set}/${name}` : name;

    return [
      <div className={oppName ? 'OppDeck' : 'DeckZone'}>
        <img
          alt="noseve"
          src={require('../../cards/cardback.jpg')}
          title={oppName ? `Mazo de ${oppName}` : 'Tu Mazo'}
          style={{ marginBottom: '1.5vh', visibility: deckVisible }}
        />
        {discardTop && (
          <img
            alt="noseve"
            className="showesModal"
            title={oppName ? `Descartes de ${oppName}` : 'Tus Descartes'}
            onClick={this.showModal}
            src={require(`../../cards/${route}.jpg`)}
          />
        )}
      </div>,
      <CardDisplayModal
        background="rgba(255, 153, 153, 0.9)"
        showModal={this.state.show}
        hideModal={this.hideModal}
        cards={[...discard].reverse()}
        title={oppName ? `Descartes de ${oppName}` : 'Tus Descartes'}
      />,
    ];
  }
}
