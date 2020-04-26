import React from 'react';
import PropTypes from 'prop-types';

import CardDisplayModal from './CardDisplayModal';

export default class PrivateMaidsDisplay extends React.Component {
  static contextTypes = {
    updateImage: PropTypes.func,
    parentState: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  hideModal = () => this.setState({ show: false });
  showModal = () => this.setState({ show: true });

  getDisplayedMaids = () => {
    const { privateMaids } = this.props;
    const displayedMaids = [];
    for (let i = 2; i >= 0; i--) {
      if (privateMaids[i]) {
        displayedMaids.push(this.getRoute(privateMaids[i]));
        const { attachments } = privateMaids[i];
        (attachments || []).forEach((item) => {
          displayedMaids.push(this.getRoute(item));
        });
      }
    }
    return displayedMaids.filter((foo, idx) => {
      return idx >= displayedMaids.length - 3;
    });
  };

  getRoute = (card) => {
    const { name, set } = card;
    return set ? `set${set}/${name}` : name;
  };

  getCardImage = (card, topMaid, style) => {
    const selecting =
      this.context.parentState.gameState === 'targetChamberMaid';
    return (
      <img
        alt="noseve"
        className={`showesModal ${selecting ? 'selectable' : ''}`}
        title="Tus Maids Particulares"
        src={require(`../cards/${card}.jpg`)}
        onMouseOver={() => {
          this.context.updateImage(topMaid);
        }}
        onMouseOut={() => {
          this.context.updateImage(null);
        }}
        onClick={this.showModal}
        style={style}
      />
    );
  };

  render() {
    const { oppName } = this.props;
    const displayedMaids = this.getDisplayedMaids();
    if (displayedMaids.length <= 0) return null;
    const topMaid = displayedMaids[displayedMaids.length - 1];

    return [
      <div className="cardBlock" style={{ position: 'relative' }}>
        {this.getCardImage(displayedMaids[0], topMaid, {})}
        {displayedMaids[1] &&
          this.getCardImage(displayedMaids[1], topMaid, {
            position: 'absolute',
            top: '1.5vw',
            left: 0,
          })}
        {displayedMaids[2] &&
          this.getCardImage(displayedMaids[2], topMaid, {
            position: 'absolute',
            top: '3vw',
            left: 0,
          })}
      </div>,
      <CardDisplayModal
        showModal={this.state.show}
        background="rgba(0,0,0,0.75)"
        cards={this.props.privateMaids}
        hideModal={this.hideModal}
        oppName={oppName}
        title={
          oppName ? `Maids Particulares de ${oppName}` : 'Tus Maids Paticulares'
        }
        mode="privateMaids"
      />,
    ];
  }
}
