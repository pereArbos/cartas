import React from 'react';
import PropTypes from 'prop-types';

import CardDisplayModal from '../../cardDisplayModal/CardDisplayModal';

export default class PlayZone extends React.Component {
  static contextTypes = {
    playerState: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  hideModal = () => this.setState({ show: false });
  showModal = () => this.setState({ show: true });

  render() {
    const { playedCards } = this.context.playerState;
    return [
      <div
        className="PlayZone showesModal"
        title="Tus Cartas Jugadas"
        onClick={this.showModal}
      >
        {playedCards.map((card, idx) => {
          const { name, set } = card;
          const route = set ? `set${set}/${name}` : name;
          return (
            idx < 12 && (
              <img alt="noseve" src={require(`../../cards/${route}.jpg`)} />
            )
          );
        })}
      </div>,
      <CardDisplayModal
        background="rgba(179, 179, 0, 0.85)"
        showModal={this.state.show}
        hideModal={this.hideModal}
        cards={playedCards}
        title="Tus Cartas Jugadas"
      />,
    ];
  }
}
