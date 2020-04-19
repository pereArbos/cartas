import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import CardDisplayModal from '../../cardDisplayModal/CardDisplayModal';
import PrivateMaidsDisplay from '../../cardDisplayModal/PrivateMaidsDisplay';

export default class ChamberZone extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { show: false, chamberMaids: [], boughtPrivateMaids: [] };
  }

  componentDidMount() {
    this.context.updateParent({
      getChamberMaid: this.getChamberMaid,
      getPrivateMaid: this.getPrivateMaid,
      getAttachment: this.getAttachment,
    });
  }

  getChamberMaid = (card) => {
    this.setState((prevState) => {
      const newMaids = _.cloneDeep(prevState.chamberMaids);
      const idx = newMaids.findIndex((item) => {
        const hasAttachments = item.attachments && item.attachments[0];
        return !hasAttachments && item.name === card.name;
      });
      if (idx >= 0) {
        newMaids[idx].chambered = newMaids[idx].chambered + 1;
      } else {
        newMaids.push({ ...card, chambered: 1 });
      }
      return { chamberMaids: newMaids };
    });
  };

  getAttachment = (maidIdx, card, isPrivate) => {
    if (isPrivate) {
      this.setState((prevState) => {
        const privateMaids = _.cloneDeep(prevState.boughtPrivateMaids);
        const attachments = privateMaids[0] && privateMaids[0].attachments;
        privateMaids[0].attachments = [...(attachments || []), card];
        return { boughtPrivateMaids: privateMaids };
      });
      return;
    }
    this.setState((prevState) => {
      let newMaids = _.cloneDeep(prevState.chamberMaids);
      const maid = newMaids[maidIdx];
      const attachments = [...(maid.attachments || []), card];
      // Quitar maid con antiguos attachments
      if (maid.chambered > 1) {
        newMaids[maidIdx].chambered -= 1;
      } else {
        newMaids = newMaids.filter((foo, idx) => idx !== maidIdx);
      }
      // Meter maid con nuevos attachments
      const newIdx = newMaids.findIndex((item) => {
        const same = this.hasSameAttachments(item.attachments, attachments);
        return item.name === maid.name && same;
      });
      if (newIdx >= 0) {
        newMaids[newIdx].chambered += 1;
      } else {
        newMaids.push({ ...maid, chambered: 1, attachments });
      }
      return { chamberMaids: newMaids };
    });
  };

  hasSameAttachments = (list1, list2) => {
    const namelist1 = (list1 || []).map((item) => item.name);
    const namelist2 = (list2 || []).map((item) => item.name);
    return _.isEqual(namelist1, namelist2);
  };

  getPrivateMaid = (card) => {
    this.setState((prevState) => {
      return { boughtPrivateMaids: [card, ...prevState.boughtPrivateMaids] };
    });
  };

  hideModal = () => this.setState({ show: false });
  showModal = () => this.setState({ show: true });

  getRoute = (card) => {
    const { name, set } = card;
    return set ? `set${set}/${name}` : name;
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
        />
        {hasAttachments && (
          <img
            alt="noseve"
            src={require(`../../cards/${this.getRoute(topAttachment)}.jpg`)}
            style={{ position: 'absolute', top: '0.4vw', left: 0 }}
          />
        )}
      </div>
    );
  };

  render() {
    const { chamberMaids, boughtPrivateMaids } = this.state;
    const currentMaid = boughtPrivateMaids[0];
    const displayLimit = currentMaid ? 7 : 8;
    const hasMaids =
      currentMaid || chamberMaids.find((maid) => maid.type.includes('maid'));
    const hasBorder =
      this.context.parentState.gameState === 'targetChamberMaid' && hasMaids;

    return [
      <div
        className={`ChamberZone showesModal ${hasBorder ? 'selectable' : ''}`}
        title="Tu Habitación Privada"
        onClick={this.showModal}
      >
        {currentMaid && this.renderCard(currentMaid)}
        {chamberMaids.map((card, idx) => {
          return idx < displayLimit ? this.renderCard(card) : null;
        })}
      </div>,
      <CardDisplayModal
        extraCmp={() => (
          <PrivateMaidsDisplay privateMaids={boughtPrivateMaids} />
        )}
        background="rgba(0, 190, 0, 0.8)"
        showModal={this.state.show}
        hideModal={this.hideModal}
        cards={chamberMaids}
        title="Tu Habitación Privada"
        mode="chamber"
      />,
    ];
  }
}
