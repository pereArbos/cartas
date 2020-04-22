import React from 'react';
import PropTypes from 'prop-types';
import { LioWebRTC } from 'react-liowebrtc';

import MainGame from './MainGame';
import { initiateCity } from './field/CityGenerator';
import { initialDeck } from './initialDeck.js';
import { shuffle } from './helpers/actions';

export default class ConnexionGame extends React.Component {
  static childContextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
    attachEvent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      deck: [],
      discard: [],
      attachmentsLeft: [],
    };
  }

  getChildContext() {
    return {
      parentState: this.state,
      updateParent: (data, cb) => {
        this.setState(data, () => {
          if (typeof cb === 'function') cb();
        });
      },
      attachEvent: this.attachEvent,
    };
  }

  componentDidMount() {
    this.setState(initiateCity(), this.getInitialDeck);
  }

  getInitialDeck = () => {
    this.setState(
      (prevState) => {
        const newCity = prevState.city.map((card) => {
          return { ...card, selected: initialDeck[card.name] };
        });
        return { city: newCity };
      },
      () => {
        this.setState({ getDeck: 1, sendTo: this.sendToDeck });
      }
    );
  };

  sendToDeck = (cards) => {
    this.setState(
      { deck: shuffle(cards), gameState: 'servingPhase' }, // En realidad se pasaría a la espera de empezar el juego
      this.state.getInitialHand
    );
  };

  attachEvent = (card, selected) => {
    this.setState((prevState) => {
      let data = {
        attachmentsLeft: [...prevState.attachmentsLeft],
      };
      if (data.attachmentsLeft.length === 0) {
        data = { ...data, ...this.getAttachInfo(card) };
      }
      for (let i = 0; i < selected; i++) {
        data.attachmentsLeft.push(card);
      }
      return data;
    });
  };

  getAttachInfo = (card) => {
    switch (card.attachTo) {
      case 'maid':
        return {
          gameState: 'targetChamberMaid',
          maidClick: (maidIdx, isPrivate) => {
            this.removePendingAttach();
            this.state.getAttachment(maidIdx, card, isPrivate);
          },
        };
      default:
        return {
          gameState: 'targetPlayer',
          playerClick: () => {
            this.removePendingAttach();
            this.state.getChamberMaid(card); // Aquí iría esto o mandársela a otro
          },
        };
    }
  };

  removePendingAttach = () => {
    this.setState((prevState) => {
      const left = [...prevState.attachmentsLeft].filter((foo, idx) => idx > 0);
      let data = { attachmentsLeft: left };
      if (left[0]) {
        data = { ...data, ...this.getAttachInfo(left[0]) };
      } else data.gameState = 'discardPhase';
      return data;
    });
  };

  join = (webrtc) => {
    webrtc.joinRoom('cartasPereTantoCuore_v1');
    this.setState({ webrtc });
  };

  onCreatedPeer = (webrtc, peer) => {
    this.setState({ webrtc });
  };

  getPeerData = (webrtcBad, type, payload, peer) => {
    const { webrtc, city, privateMaids } = this.state;
    switch (type) {
      case 'cityQuery':
        (webrtc || webrtcBad).whisper(peer, 'cityUpdate', {
          city,
          privateMaids,
        });
        break;
      case 'cityUpdate':
        this.setState(payload);
        break;
      default:
        break;
    }
  };

  render() {
    return (
      <LioWebRTC
        options={{ debug: true, dataOnly: true }}
        onReady={this.join}
        onCreatedPeer={this.handleCreatedPeer}
        onReceivedPeerData={this.getPeerData}
      >
        <MainGame />
      </LioWebRTC>
    );
  }
}
