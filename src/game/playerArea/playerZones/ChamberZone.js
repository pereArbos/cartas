import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import CardDisplayModal from '../../cardDisplayModal/CardDisplayModal';
import PrivateMaidsDisplay from '../../cardDisplayModal/PrivateMaidsDisplay';
import { checkChamberMaids } from '../../helpers/actions';
import { getChamberMaid, getAttachment } from './helpers/dataUpdates';

export default class ChamberZone extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
    updatePlayer: PropTypes.func,
    updateImage: PropTypes.func,
    draw: PropTypes.func,
    updateMessage: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      chamberMaids: [],
      boughtPrivateMaids: [],
    };
  }

  componentDidMount() {
    if (!this.props.oppName) {
      this.context.updateParent({
        getChamberMaid: (card) => getChamberMaid(this, card),
        getPrivateMaid: this.getPrivateMaid,
        getAttachment: (data) => getAttachment(this, data),
        hasChamberMaids: () => checkChamberMaids(this.state),
        getCurrentMaid: this.getHealthyMaid,
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
      const oldState = this.context.parentState.gameState;
      const newState = nextContext.parentState.gameState;
      if (oldState !== newState && newState === 'startPhase') {
        const currentMaid = this.getHealthyMaid();
        if (currentMaid && currentMaid.onStart) {
          if (currentMaid.auto) currentMaid.onStart(this.context);
        } else this.context.updateParent({ gameState: 'servingPhase' });
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

  hideModal = () => this.setState({ show: false });

  showModal = () => {
    const { oppName } = this.props;
    this.context.updateParent({ targetChamber: oppName });
    this.setState({ show: true });
  };

  getRoute = (card) => {
    const { name, set } = card;
    return set ? `set${set}/${name}` : name;
  };

  hasIllness = (card) => {
    if (!card.attachments) return false;
    const ill = card.attachments.find((item) => item.name === 'Illness');
    return ill ? true : false;
  };

  getHealthyMaid = () => {
    const currentMaid = this.state.boughtPrivateMaids[0];
    if (!currentMaid) return null;
    return this.hasIllness(currentMaid) ? null : currentMaid;
  };

  getExtra = (card) => {
    const { gameState } = this.context.parentState;
    if (card.type !== 'privateMaid' || gameState !== 'startPhase') return {};
    if (card.auto || !card.onStart || this.hasIllness(card)) return {};
    return {
      className: 'playable',
      onClick: (e) => {
        e.stopPropagation();
        card.onStart(this.context);
      },
      onMouseOver: () => this.context.updateImage(this.getRoute(card)),
      onMouseOut: () => this.context.updateImage(null),
    };
  };

  renderCard = (card) => {
    const { attachments } = card;
    const hasAttachments = attachments && attachments[0];
    const topAttachment = hasAttachments && attachments[attachments.length - 1];

    return (
      <div style={{ position: 'relative', float: 'left' }}>
        <img
          alt="noseve"
          src={require(`../../cards/${this.getRoute(card)}.jpg`)}
          {...(this.props.oppName ? {} : this.getExtra(card))}
        />
        {hasAttachments && (
          <img
            alt="noseve"
            src={require(`../../cards/${this.getRoute(topAttachment)}.jpg`)}
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
    const hasBorder = gameState === 'targetChamberMaid' && hasMaids;

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
        {chamberMaids.map((card, idx) => {
          return idx < displayLimit ? this.renderCard(card) : null;
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
