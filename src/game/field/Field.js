import React from 'react';
import PropTypes from 'prop-types';
import './Field.css';

import { getCity } from './CityGenerator';

export default class Field extends React.Component {
  static contextTypes = {
    updateParent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.setState({ city: getCity() });
  }

  getCardBlock = (card) => {
    const { name, set, quantity } = card;
    const route = set ? `set${set}/${name}` : name;
    return (
      <span className="card-block">
        <img
          alt="noseve"
          name={route}
          src={require(`../cards/${route}.jpg`)}
          style={name === 'cardback' ? { cursor: 'auto' } : {}}
          onMouseOver={(e) => {
            this.context.updateParent({ imageName: e.target.name });
          }}
          onMouseOut={() => {
            this.context.updateParent({ imageName: null });
          }}
        />
        {quantity ? (
          <h3>{quantity}</h3>
        ) : (
          <h3 style={{ color: 'rgba(255, 0, 0, 0)' }}>1</h3>
        )}
      </span>
    );
  };

  render() {
    const { city } = this.state;
    return (
      <div className="Field">
        <div style={{ float: 'left' }}>
          {city && city.map((item) => this.getCardBlock(item))}
        </div>
      </div>
    );
  }
}
