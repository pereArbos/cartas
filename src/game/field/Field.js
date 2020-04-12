import React from 'react';
import PropTypes from 'prop-types';
import './Field.css';

import CardBlock from './CardBlock';
import { initiateCity } from './CityGenerator';

export default class Field extends React.Component {
  static contextTypes = {
    updateParent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.setState(initiateCity());
  }

  updateCard = (name, newCard) => {
    this.setState((prevState) => {
      const { city } = prevState;
      const index = city.findIndex((card) => card.name === name);
      city[index] = newCard;
      return { city };
    });
  };

  selectCard = (card, mode = 'new') => {
    if (!card || card.name === 'cardback') return;
    switch (mode) {
      case 'plus':
        card.selected += 1;
        break;
      case 'minus':
        card.selected -= 1;
        break;
      default:
        if (card.quantity !== 0 && !this.privateSelectedTwice(card)) {
          if (!card.selected || card.selected < 1) card.selected = 1;
        }
    }
    this.updateCard(card.name, card);
  };

  privateSelectedTwice = (card) => {
    const index = this.state.city.findIndex((item) => {
      return item.selected >= 1 && item.type === 'privateMaid';
    });
    return index >= 0 && card.type === 'privateMaid';
  };

  buyCards = () => {
    const boughtCards = [];
    this.state.city.forEach((card) => {
      const { selected, name, type } = card;
      if (selected && selected > 0) {
        if (type === 'privateMaid') {
          this.buyPrivateMaid(name);
        } else {
          card.selected = 0;
          card.quantity -= selected;
          this.updateCard(name, card);
        }
        for (let i = 0; i < selected; i++) {
          boughtCards.push(card);
        }
      }
    });
    // send boughtCards
    console.log(boughtCards.map((card) => card.name));
  };

  buyPrivateMaid = (name) => {
    this.setState((prevState) => {
      const { city, privateMaids } = prevState;
      const cardBack = city.find((card) => card.name === 'cardback') || {};
      const newCity = city.filter((card) => card.name !== name);
      let newPrivateMaids = privateMaids;
      if (privateMaids[0]) {
        const backIndex = newCity.findIndex((card) => card.name === 'cardback');
        newCity[backIndex] = { ...cardBack, quantity: cardBack.quantity - 1 };
        newCity.push(privateMaids[0]);
        newPrivateMaids = privateMaids.filter((card, idx) => idx > 0);
      }
      return { city: newCity, privateMaids: newPrivateMaids };
    });
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
