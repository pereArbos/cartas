import React from 'react';
import PropTypes from 'prop-types';

import CardDisplayModal from '../../cardDisplayModal/CardDisplayModal';

export default class PlayZone extends React.Component {
  static contextTypes = {
    playerState: PropTypes.object,
    parentState: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  hideModal = () => this.setState({ show: false });
  showModal = () => this.setState({ show: true });

  render() {
    const { playedCards } = this.context.playerState || {};
    const { opp } = this.props;
    const cards = opp ? this.context.parentState.discard : playedCards;
    const limit = opp ? 4 : 12;

    return [
      <div
        className={`${opp ? 'OppPlay' : 'PlayZone'} showesModal`}
        title={opp ? `Cartas Jugadas por ${opp}` : 'Tus Cartas Jugadas'}
        onClick={this.showModal}
      >
        {cards.map((card, idx) => {
          const { name, set } = card;
          const route = set ? `set${set}/${name}` : name;
          return (
            idx < limit && (
              <img alt="noseve" src={require(`../../cards/${route}.jpg`)} />
            )
          );
        })}
      </div>,
      <CardDisplayModal
        background="rgba(179, 179, 0, 0.85)"
        showModal={this.state.show}
        hideModal={this.hideModal}
        cards={cards}
        title={opp ? `Cartas Jugadas por ${opp}` : 'Tus Cartas Jugadas'}
      />,
    ];
  }
}
