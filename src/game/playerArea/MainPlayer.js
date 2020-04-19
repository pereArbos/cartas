import React from 'react';
import PropTypes from 'prop-types';
import './MainPlayer.css';

import PlayZone from './playerZones/PlayZone';
import HandZone from './playerZones/HandZone';
import ChamberZone from './playerZones/ChamberZone';
import DeckZone from './playerZones/DeckZone';
import './playerZones/PlayerZones.css';

import IconFooter from './iconFooter/IconFooter';

export default class MainPlayer extends React.Component {
  static childContextTypes = {
    playerState: PropTypes.object,
  };

  static contextTypes = {
    parentState: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { hand: [], playedCards: [] };
  }

  getChildContext() {
    return { playerState: this.state };
  }

  getRightFooter = () => {
    const { deck, discard } = this.context.parentState;
    const { hand } = this.state;
    return {
      data: [
        ['deck.png', deck && deck.length],
        ['hand.png', hand && hand.length],
        ['trash.png', discard && discard.length],
      ],
      firstLeft: 57,
    };
  };

  getLeftFooter = () => {
    const { servings, love, contract } = this.state;
    return {
      data: [
        ['servings.png', servings],
        ['love.png', love],
        ['contract.png', contract],
      ],
      firstLeft: 25,
    };
  };

  render() {
    const { gameState, playerClick } = this.context.parentState;
    const circleOn = gameState === 'targetPlayer' && playerClick;
    const playerClass = circleOn ? 'selectable' : '';
    const circleClick = circleOn ? playerClick : () => {};

    return (
      <div className="PlayerArea">
        <div className="PlayerTable">
          <PlayZone />
          <HandZone />
          <ChamberZone />
          <DeckZone />
        </div>
        <span className={`PlayerCircle ${playerClass}`} onClick={circleClick}>
          <span className="PlayerName">PERE</span>
        </span>
        <IconFooter {...this.getRightFooter()} />
        <IconFooter {...this.getLeftFooter()} />
      </div>
    );
  }
}
