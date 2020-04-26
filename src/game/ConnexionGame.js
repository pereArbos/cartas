import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { LioWebRTC } from 'react-liowebrtc';

import MainGame from './MainGame';
import { initiateCity } from './field/CityGenerator';
import { initialDeck, initialOppData } from './initialData.js';
import { shuffle } from './helpers/actions';

export default class ConnexionGame extends React.Component {
  static childContextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
    attachEvent: PropTypes.func,
    updateMessage: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      discard: [],
      attachmentsLeft: [],
      mainPlayer: props.mainPlayer,
      playerName: props.playerName,
      opponents: [],
      message: '',
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
      updateMessage: this.updateMessage,
    };
  }

  componentDidMount() {
    if (this.state.mainPlayer) {
      this.setState(initiateCity(), this.getInitialDeck);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { deck, discard, webrtc, playerName } = this.state;
    if (webrtc && !_.isEqual(discard, prevState.discard)) {
      webrtc.shout('oppUpdate', {
        name: playerName,
        data: { deck },
      });
    }
    if (webrtc && !_.isEqual(discard, prevState.discard)) {
      webrtc.shout('oppUpdate', {
        name: playerName,
        data: { discard },
      });
    }
  }

  updateMessage = (message) => {
    const { webrtc } = this.state;
    this.setState({ message });
    if (webrtc) webrtc.shout('msgUpdate', message);
  };

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
      { deck: shuffle(cards), gameState: 'startPhase' }, // En realidad se pasaría a la espera de empezar el juego
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
            const { webrtc, opponents, targetChamber, playerName } = this.state;
            if (targetChamber) {
              const opp = opponents.find((item) => item.name === targetChamber);
              const data = { maidIdx, card, isPrivate };
              if (webrtc) webrtc.whisper(opp.peer, 'sendAttach', data);
            } else
              this.state.getAttachment({
                maidIdx,
                card,
                isPrivate,
              });
            this.updateMessage(
              `${playerName} envía 1 ${card.name} a ${
                targetChamber || playerName
              }.`
            );
          },
        };
      default:
        return {
          gameState: 'targetPlayer',
          playerClick: (name) => {
            this.removePendingAttach();
            const { webrtc, opponents, playerName } = this.state;
            if (name) {
              const opp = opponents.find((item) => item.name === name);
              if (webrtc) webrtc.whisper(opp.peer, 'sendEvent', card);
            } else this.state.getChamberMaid(card);
            this.updateMessage(
              `${playerName} envía 1 ${card.name} a ${name || playerName}.`
            );
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
    this.setState({ webrtc }, () => {
      if (!this.state.mainPlayer) {
        this.state.webrtc.shout('hola', this.state.playerName);
      }
    });
  };

  onJoin = () => {
    const { mainPlayer, playerName, webrtc } = this.state;
    if (!mainPlayer) {
      console.log('saludando');
      setTimeout(() => webrtc.shout('hola', playerName), 3000);
    }
  };

  getPeerData = (webrtcBad, type, payload, peer) => {
    const { webrtc, city, privateMaids, deck, playerName } = this.state;
    switch (type) {
      case 'hola':
        if (this.state.mainPlayer) {
          (webrtc || webrtcBad).whisper(peer, 'cityUpdate', {
            city,
            privateMaids,
          });
        }
        this.getOpp(peer, payload);
        (webrtc || webrtcBad).whisper(peer, 'queTal', playerName);
        break;
      case 'queTal':
        this.getOpp(peer, payload);
        break;
      case 'cityUpdate':
        this.setState(payload, () => {
          if (!deck) this.getInitialDeck();
        });
        break;
      case 'oppUpdate':
        this.setState((prevState) => {
          const opponents = _.cloneDeep(prevState.opponents);
          const idx = opponents.findIndex((opp) => opp.name === payload.name);
          opponents[idx].data = {
            ...opponents[idx].data,
            ...payload.data,
          };
          return { opponents };
        });
        break;
      case 'msgUpdate':
        this.setState({ message: payload });
        break;
      case 'sendEvent':
        this.state.getChamberMaid(payload);
        break;
      case 'sendAttach':
        this.state.getAttachment(payload);
        break;
      default:
        break;
    }
  };

  getOpp = (peer, name) => {
    this.setState((prevState) => {
      const opponents = [...prevState.opponents];
      opponents.push({ peer, name, data: initialOppData });
      return { opponents };
    });
  };

  render() {
    return (
      <LioWebRTC
        options={{ debug: false, dataOnly: true }}
        onReady={this.join}
        onReceivedPeerData={this.getPeerData}
        onJoinedRoom={this.onJoin}
      >
        <MainGame />
      </LioWebRTC>
    );
  }
}
