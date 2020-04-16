import React from 'react';
import PropTypes from 'prop-types';
import { LioWebRTC } from 'react-liowebrtc';

import MainGame from './MainGame';
import { initiateCity } from './field/CityGenerator';
import { initialDeck } from './initialDeck.js';

export default class ConnexionGame extends React.Component {
  static childContextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      deck: [],
      discard: [],
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
        this.setState({ getDeck: 1 });
      }
    );
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
