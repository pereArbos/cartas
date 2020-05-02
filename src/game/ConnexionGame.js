import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { LioWebRTC } from 'react-liowebrtc';

import MainGame from './MainGame';
import SingleCardModal from './cardDisplayModal/SingleCardModal';
import ResultsModal from './cardDisplayModal/ResultsModal';
import { initiateCity } from './field/CityGenerator';
import { initialDeck, initialOppData } from './initialData.js';
import { shuffle, attachEvent } from './helpers/actions';

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
      msgTitle: 'Preparando la partida...',
      showSCModal: false,
      showResultsModal: false,
      results: [],
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
      attachEvent: (card, selected) => attachEvent(this, card, selected),
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
      { deck: shuffle(cards), gameState: 'gameSetUp' },
      this.state.getInitialHand
    );
  };

  join = (webrtc) => {
    webrtc.joinRoom('cartasPereTantoCuore_v1');
    this.setState({ webrtc });
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
      case 'turnOrder':
        this.setState({
          msgTitle: `Turno de ${payload[0]}`,
          turnNum: 0,
          turnOrder: payload,
          gameState: payload[0] === playerName ? 'startPhase' : 'opponentTurn',
        });
        break;
      case 'cityUpdate':
        this.setState(
          { city: payload.city, privateMaids: payload.privateMaids },
          () => {
            if (!deck) this.getInitialDeck();
          }
        );
        break;
      case 'oppUpdate':
        this.setState((prevState) => {
          const newOpps = prevState.opponents.slice();
          const oppIdx = prevState.opponents.findIndex(
            (opp) => opp.name === payload.name
          );
          Object.keys(payload.data).forEach((key) => {
            newOpps[oppIdx].data[key] = payload.data[key];
          });
          return { opponents: newOpps };
        });
        break;
      case 'msgUpdate':
        this.setState({ message: payload });
        break;
      case 'passTurn':
        const { turnNum, turnOrder } = this.state;
        const newTurn = turnOrder[(turnNum + 1) % turnOrder.length];
        this.setState(
          {
            msgTitle: `Turno de ${newTurn}`,
            turnNum: turnNum + 1,
            gameState: newTurn === playerName ? 'startPhase' : 'opponentTurn',
          },
          this.state.checkGameFinish
        );
        break;
      case 'sendEvent':
        this.state.getChamberMaid(...payload);
        break;
      case 'sendAttach':
        this.state.getAttachment(payload);
        this.state.getDefend(payload);
        break;
      case 'sendAction':
        this.state.getForcedAction(payload);
        break;
      case 'results':
        this.setState((prevState) => {
          return {
            results: [...prevState.results, payload].sort((a, b) =>
              a.vp > b.vp ? -1 : 1
            ),
          };
        });
        break;
      default:
        break;
    }
  };

  getOpp = (peer, name) => {
    this.setState((prevState) => {
      const opponents = _.cloneDeep(prevState.opponents);
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
        <SingleCardModal />
        <ResultsModal />
      </LioWebRTC>
    );
  }
}
