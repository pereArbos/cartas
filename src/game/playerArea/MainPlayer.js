import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './MainPlayer.css';

import PlayZone from './playerZones/PlayZone';
import HandZone from './playerZones/handZone/HandZone';
import ChamberZone from './playerZones/ChamberZone';
import DeckZone from './playerZones/DeckZone';
import './playerZones/PlayerZones.css';

import IconFooter from './iconFooter/IconFooter';
import { shuffle, handleAction, checkGameFinish } from '../helpers/actions';

const serviceStates = ['cityPick', 'targetIllness', 'targetPlayer'];

export default class MainPlayer extends React.Component {
  static childContextTypes = {
    playerState: PropTypes.object,
    updatePlayer: PropTypes.func,
    draw: PropTypes.func,
  };

  static contextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { hand: [], playedCards: [], love: 0, servings: 0 };
  }

  getChildContext() {
    return {
      playerState: this.state,
      updatePlayer: (data, cb) => {
        this.setState(data, () => {
          if (typeof cb === 'function') cb();
        });
      },
      draw: this.drawAndReload,
    };
  }

  componentDidMount() {
    this.context.updateParent({
      getInitialHand: () => this.drawCards(5),
      getForcedAction: (data) => handleAction(data, this),
      checkGameFinish: () => checkGameFinish(this),
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { hand, playedCards } = this.state;
    const { webrtc, playerName } = this.context.parentState;

    if (webrtc && !_.isEqual(hand, prevState.hand)) {
      webrtc.shout('oppUpdate', { name: playerName, data: { hand } });
    }
    if (webrtc && !_.isEqual(playedCards, prevState.playedCards)) {
      webrtc.shout('oppUpdate', { name: playerName, data: { playedCards } });
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const oldState = this.context.parentState.gameState;
    const newState = nextContext.parentState.gameState;
    if (oldState !== newState) {
      if (newState === 'servingPhase' && !serviceStates.includes(oldState)) {
        this.setState((prevState) => {
          const { servings, contract } = prevState;
          return {
            servings: (servings || 0) + 1,
            contract: (contract || 0) + 1,
          };
        });
      } else if (newState === 'discardPhase') {
        let playedCards = [];
        this.setState((prevState) => {
          playedCards = prevState.playedCards;
          return { contract: 0, love: 0, playedCards: [] };
        });
        this.context.updateParent((prevState) => {
          const discard = [...prevState.discard];
          discard.push(...playedCards);
          return { discard }; // pasar turno
        });
      }
    }
  }

  drawAndReload = (amount, cb) => {
    this.context.updateParent(
      (prevState) => {
        const { deck, discard } = prevState;
        if (deck.length < amount) {
          return { deck: [...deck, ...shuffle([...discard])], discard: [] };
        }
        return {};
      },
      () => this.drawCards(amount, cb)
    );
  };

  drawCards = (amount, cb = () => {}) => {
    const { deck, webrtc, playerName } = this.context.parentState;
    const hand = [...deck.splice(0, amount), ...this.state.hand];
    this.setState({ hand }, () => cb(hand));
    this.context.updateParent({ deck }, () => {
      if (webrtc)
        webrtc.shout('oppUpdate', {
          name: playerName,
          data: { deck },
        });
    });
  };

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
    const { parentState } = this.context;
    const {
      gameState,
      playerClick,
      playerName,
      hasChamberMaids,
      freeChambersToo,
    } = parentState;
    const checkMaids =
      (typeof hasChamberMaids === 'function' && hasChamberMaids()) ||
      freeChambersToo;
    const circleOn = gameState === 'targetPlayer' && playerClick && checkMaids;
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
        <span
          className={`PlayerCircle ${playerClass}`}
          onClick={() => {
            circleClick(null);
          }}
        >
          {playerName}
        </span>
        <IconFooter {...this.getRightFooter()} />
        <IconFooter {...this.getLeftFooter()} />
      </div>
    );
  }
}
