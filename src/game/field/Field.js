import React from 'react';
import PropTypes from 'prop-types';
import './Field.css';

import CardBlock from './CardBlock';
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

  getCardByName = (name) => {
    return this.state.city.find((card) => card.name === name);
  };

  updateCard = (name, newCard) => {
    this.setState((prevState) => {
      const { city } = prevState;
      const index = city.findIndex((card) => card.name === name);
      city[index] = newCard;
      return { city };
    });
  };

  selectCard = (name, mode = 'new') => {
    const card = this.getCardByName(name);
    if (!card || name === 'cardback') return;
    switch (mode) {
      case 'plus':
        card.selected += 1;
        break;
      case 'minus':
        card.selected -= 1;
        break;
      default:
        if (!card.selected || card.selected < 1) {
          if (card.quantity !== 0) card.selected = 1;
        }
    }
    this.updateCard(name, card);
  };

  buyCards = () => {
    const boughtCards = [];
    this.state.city.forEach((card) => {
      const { selected, name } = card;
      if (selected && selected > 0) {
        card.selected = 0;
        card.quantity -= selected;
        this.updateCard(name, card);
        for (let i = 0; i < selected; i++) {
          boughtCards.push(card);
        }
      }
    });
    // send boughtCards
    console.log(boughtCards.map((card) => card.name));
  };

  render() {
    const { city } = this.state;
    return (
      <div className="Field">
        <div style={{ float: 'left' }}>
          {city &&
            city.map((item) => (
              <CardBlock card={item} selectCard={this.selectCard} />
            ))}
          <button
            type="button"
            style={{ marginLeft: '2vw' }}
            onClick={this.buyCards}
          >
            Hecho
          </button>
        </div>
      </div>
    );
  }
}
