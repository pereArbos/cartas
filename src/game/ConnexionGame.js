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
    console.log(prevState, this.state);
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
    webrtc.joinRoom(`cartasPereTantoCuore_v4_${this.props.roomNum}`);
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
    const { deck, playerName } = this.state;
    switch (type) {
      case 'hola':
        this.handleOpp(peer, payload);
        break;
      case 'queTal':
        console.log('reb ktal', payload);
        this.getOpp(peer, payload);
        break;
      case 'recoverData':
        this.getRecover(peer, payload);
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
          (prevState) => {
            const { city, privateMaids } = prevState;
            return {
              city: payload.city || city,
              privateMaids: payload.privateMaids || privateMaids,
            };
          },
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
          newOpps.peer = peer;
          return { opponents: newOpps };
        });
        break;
      case 'msgUpdate':
        this.setState({ message: payload });
        break;
      case 'newTurn':
        const { turnOrder, gameState } = this.state;
        const { turnNum } = payload;
        const newTurn = turnOrder[turnNum % turnOrder.length];
        this.setState(
          { msgTitle: `Turno de ${newTurn}`, turnNum },
          this.state.checkGameFinish
        );
        if (newTurn === playerName && gameState !== 'servingPhase') {
          this.setState({ gameState: 'startPhase' });
        }
        break;
      case 'sendEvent':
        this.state.getDefend(payload, false);
        break;
      case 'sendAttach':
        this.state.getDefend(payload, true);
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
      const oppIdx = opponents.findIndex((opp) => opp.name === name);
      console.log(opponents, name);
      if (oppIdx >= 0) {
        console.log('aki', opponents[oppIdx], peer);
        opponents[oppIdx] = { ...opponents[oppIdx], peer };
      } else opponents.push({ peer, name, data: initialOppData });
      return { opponents };
    });
  };

  handleOpp = (peer, name) => {
    const { webrtc, city, privateMaids, opponents, playerName } = this.state;
    const recoveringOpp = opponents.find((opp) => opp.name === name);
    if (!recoveringOpp) {
      if (this.state.mainPlayer) {
        webrtc.whisper(peer, 'cityUpdate', {
          city,
          privateMaids,
        });
      }
    } else if (this.state.mainPlayer) {
      const hostData = { name: playerName, data: this.state.getPlayerData() };
      const selfData = recoveringOpp.data;
      const otherOpps = opponents
        .filter((opp) => opp.name !== name)
        .map((opp) => {
          return { name: opp.name, data: opp.data };
        });
      const playersData = { hostData, selfData, otherOpps };
      const { msgTitle, message, turnNum, turnOrder } = this.state;
      webrtc.whisper(peer, 'recoverData', {
        playersData,
        gameData: { msgTitle, message, turnNum, turnOrder, city, privateMaids },
      });
    }
    this.getOpp(peer, name);
    setTimeout(() => {
      console.log('env ktal');
      webrtc.whisper(peer, 'queTal', playerName);
    }, 500);
  };

  getRecover = (peer, payload) => {
    const { turnNum, turnOrder } = payload.gameData;
    const gameState =
      turnOrder[turnNum % turnOrder.length] === this.state.playerName
        ? 'startPhase'
        : 'opponentTurn';
    const { hostData, selfData, otherOpps } = payload.playersData;
    const opponents = [...otherOpps, { ...hostData, peer }];
    this.state.setPlayerData(selfData);
    this.setState({ ...payload.gameData, gameState, opponents });
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
