import React from 'react';
import './Field.css';
import { getCity } from './CityGenerator';

export default class Field extends React.Component {
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
        <img alt="noseve" src={require(`./cards/${route}.jpg`)} />
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
