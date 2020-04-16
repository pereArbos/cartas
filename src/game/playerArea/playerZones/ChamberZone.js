import React from 'react';
import PropTypes from 'prop-types';

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
    });
  }

  getChamberMaid = (card) => {
    this.setState((prevState) => {
      const newMaids = [...prevState.chamberMaids];
      const idx = newMaids.findIndex((item) => item.name === card.name);
      if (idx >= 0) {
        newMaids[idx] = {
          ...newMaids[idx],
          chambered: newMaids[idx].chambered + 1,
        };
      } else {
        newMaids.push({ ...card, chambered: 1 });
      }
      return { chamberMaids: newMaids };
    });
  };

  getPrivateMaid = (card) => {
    this.setState((prevState) => {
      return { boughtPrivateMaids: [card, ...prevState.boughtPrivateMaids] };
    });
  };

  hideModal = () => this.setState({ show: false });
  showModal = () => this.setState({ show: true });

  renderCard = (card) => {
    const { name, set } = card;
    const route = set ? `set${set}/${name}` : name;
    return <img alt="noseve" src={require(`../../cards/${route}.jpg`)} />;
  };

  render() {
    const { chamberMaids, boughtPrivateMaids } = this.state;
    const currentMaid = boughtPrivateMaids[0];
    const displayLimit = currentMaid ? 7 : 8;

    return [
      <div
        className="ChamberZone showesModal"
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
