import React from 'react';
import PropTypes from 'prop-types';

import CardDisplayModal from './CardDisplayModal';

export default class PrivateMaidsDisplay extends React.Component {
  static contextTypes = {
    updateImage: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { show: false };
  }

  hideModal = () => this.setState({ show: false });
  showModal = () => this.setState({ show: true });

  render() {
    const topMaid = this.props.privateMaids[0];
    if (!topMaid) return null;
    const { name, set } = topMaid;
    const route = set ? `set${set}/${name}` : name;

    return [
      <div className="cardBlock">
        <img
          alt="noseve"
          className="showesModal"
          title="Tus Maids Particulares"
          src={require(`../cards/${route}.jpg`)}
          onMouseOver={() => {
            this.context.updateImage(route);
          }}
          onMouseOut={() => {
            this.context.updateImage(null);
          }}
          onClick={this.showModal}
        />
        <h3 style={{ visibility: 'hidden' }}>1</h3>
      </div>,
      <CardDisplayModal
        showModal={this.state.show}
        background="rgba(0,0,0,0.75)"
        cards={this.props.privateMaids}
        hideModal={this.hideModal}
        title="Tus Maids Particulares"
        mode="privateMaids"
      />,
    ];
  }
}
