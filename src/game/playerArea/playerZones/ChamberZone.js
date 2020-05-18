import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import CardDisplayModal from '../../cardDisplayModal/CardDisplayModal';
import PrivateMaidsDisplay from '../../cardDisplayModal/PrivateMaidsDisplay';
import { checkChamberMaids } from '../../helpers/actions';
import {
  getChamberMaid,
  getAttachment,
  getVP,
  getPlayerData,
  setPlayerData,
} from './helpers/dataUpdates';

export default class ChamberZone extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
    updatePlayer: PropTypes.func,
    updateImage: PropTypes.func,
    playerState: PropTypes.object,
    draw: PropTypes.func,
    updateMessage: PropTypes.func,
    attachEvent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      usadaJoder: 'no',
      chamberMaids: [],
      boughtPrivateMaids: [],
    };
  }

  componentDidMount() {
    if (!this.props.oppName) {
      this.context.updateParent({
        getChamberMaid: (card, add) => getChamberMaid(this, card, add),
        getPrivateMaid: this.getPrivateMaid,
        getAttachment: (data) => getAttachment(this, data),
        hasChamberMaids: () => checkChamberMaids(this.state),
        hasPlayables: this.hasPlayables,
        getCurrentMaid: this.getHealthyMaid,
        getDefend: (data, isAttachment) => this.defend(data, isAttachment),
        getResults: this.getResults,
        getPlayerData: () => getPlayerData(this),
        setPlayerData: (data) => setPlayerData(this, data),
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { chamberMaids, boughtPrivateMaids } = this.state;
    const { webrtc, playerName } = this.context.parentState;
    if (
      webrtc &&
      !_.isEqual(boughtPrivateMaids, prevState.boughtPrivateMaids)
    ) {
      webrtc.shout('oppUpdate', {
        name: playerName,
        data: { boughtPrivateMaids },
      });
    }
    if (webrtc && !_.isEqual(chamberMaids, prevState.chamberMaids)) {
      webrtc.shout('oppUpdate', {
        name: playerName,
        data: { chamberMaids },
      });
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (!this.props.oppName) {
      const oldState = this.context.parentState.gameState || '';
      const newState = nextContext.parentState.gameState;
      if (oldState !== newState && newState === 'startPhase') {
        if (!oldState.includes('target')) this.setState({ usadaJoder: 'no' });
        const currentMaid = this.getHealthyMaid();
        if (currentMaid && currentMaid.onStart) {
          if (currentMaid.auto) currentMaid.onStart(this.context);
        } else if (!this.hasPlayables()) {
          this.context.updateParent({
            gameState: 'servingPhase',
          });
        }
      }
    }
  }

  getPrivateMaid = (card) => {
    this.setState((prevState) => {
      return {
        boughtPrivateMaids: [card, ...prevState.boughtPrivateMaids],
      };
    });
  };

  defend = (data, isAttachment) => {
    const defensor = this.context.playerState.hand.find(
      (maid) => maid.onDefend
    );
    if (defensor && !data.remove) {
      defensor.onDefend(this, data, isAttachment);
    } else {
      if (isAttachment) {
        getAttachment(this, data);
      } else {
        getChamberMaid(this, ...data);
      }
    }
  };

  getResults = () => {
    const playerRes = {
      name: this.context.parentState.playerName,
      vp: getVP(this),
    };
    this.context.updateParent({ results: [playerRes] });
    const { webrtc } = this.context.parentState;
    if (webrtc)
      setTimeout(
        () => webrtc.shout('results', playerRes),
        Math.random() * 1500
      );
  };

  hideModal = () => this.setState({ show: false });
  showModal = () => this.setState({ show: true });

  getRoute = (card) => {
    const { name, set } = card;
    return set ? `set${set}/${name}` : name;
  };

  hasIllness = (card) => {
    if (!card.attachments) return false;
    return card.attachments.find((item) => item.name === 'Illness');
  };

  getHealthyMaid = () => {
    const currentMaid = this.state.boughtPrivateMaids[0];
    if (!currentMaid) return null;
    return this.hasIllness(currentMaid) ? null : currentMaid;
  };

  hasPlayables = () => {
    const { chamberMaids, boughtPrivateMaids } = this.state;
    return [...chamberMaids, boughtPrivateMaids[0] || {}].find((maid) => {
      const illness = this.hasIllness(maid);
      return illness && illness.restric(this.context);
    });
  };

  getExtra = (card, idx, isPrivate) => {
    const { gameState } = this.context.parentState;
    if (isPrivate && this.state.usadaJoder === 'si') return {};
    if (card.restric && !card.restric(this.context)) return {};
    if (gameState !== 'startPhase') return {};
    if (card.auto || !card.onStart || this.hasIllness(card)) return {};
    return {
      className: 'playable',
      onClick: (e) => {
        e.stopPropagation();
        card.onStart(this, idx, isPrivate);
      },
      onMouseOver: () => this.context.updateImage(this.getRoute(card)),
      onMouseOut: () => this.context.updateImage(null),
    };
  };

  renderCard = (card, idx) => {
    const { attachments, type } = card;
    const hasAttachments = attachments && attachments[0];
    const topAttachment = hasAttachments && attachments[attachments.length - 1];
    const isPrivate = type === 'privateMaid';

    return (
      <div style={{ position: 'relative', float: 'left' }}>
        <img
          alt="noseve"
          src={require(`../../cards/${this.getRoute(card)}.jpg`)}
          {...(this.props.oppName ? {} : this.getExtra(card, idx, isPrivate))}
        />
        {hasAttachments && (
          <img
            alt="noseve"
            src={require(`../../cards/${this.getRoute(topAttachment)}.jpg`)}
            {...(this.props.oppName
              ? {}
              : this.getExtra(topAttachment, idx, isPrivate))}
            style={{
              position: 'absolute',
              top: '0.4vw',
              left: 0,
            }}
          />
        )}
      </div>
    );
  };

  render() {
    const { oppName, oppIdx } = this.props;
    const { opponents, gameState } = this.context.parentState;
    const data = oppName ? opponents[oppIdx].data : this.state;
    const { chamberMaids, boughtPrivateMaids } = data;

    const currentMaid = boughtPrivateMaids[0];
    let displayLimit = currentMaid ? 7 : 8;
    if (oppName) displayLimit = currentMaid ? 3 : 4;

    const hasMaids =
      currentMaid || chamberMaids.find((maid) => maid.type.includes('maid'));
    let hasBorder = gameState === 'targetChamberMaid' && hasMaids;
    hasBorder = hasBorder || gameState === 'targetEvent';

    return [
      <div
        className={`${oppName ? 'OppChamber' : 'ChamberZone'} showesModal ${
          hasBorder ? 'selectable' : ''
        }`}
        title={
          oppName
            ? `Habitación Privada de ${oppName}`
            : ' Tu Habitación Privada'
        }
        onClick={this.showModal}
      >
        {currentMaid && this.renderCard(currentMaid)}
        {chamberMaids.map((card, idx, list) => {
          return idx < displayLimit ? this.renderCard(card, idx) : null;
        })}
      </div>,
      <CardDisplayModal
        extraCmp={() => (
          <PrivateMaidsDisplay
            privateMaids={boughtPrivateMaids}
            oppName={oppName}
          />
        )}
        background="rgba(0, 190, 0, 0.8)"
        showModal={this.state.show}
        hideModal={this.hideModal}
        cards={chamberMaids}
        oppName={oppName}
        title={
          oppName
            ? `Habitación Privada de ${oppName}`
            : ' Tu Habitación Privada'
        }
        mode="chamber"
      />,
    ];
  }
}
