import React from 'react';
import PropTypes from 'prop-types';
import './Field.css';

import CardBlock from './CardBlock';

export default class Field extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
  };

  updateCard = (name, newCard, cb) => {
    this.context.updateParent((prevState) => {
      const { city } = prevState;
      const index = city.findIndex((card) => card.name === name);
      city[index] = newCard;
      return { city };
    }, cb);
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
    const index = this.context.parentState.city.findIndex((item) => {
      return item.selected >= 1 && item.type === 'privateMaid';
    });
    return index >= 0 && card.type === 'privateMaid';
  };

  buyCards = () => {
    const boughtCards = [];
    this.context.parentState.city.forEach((card) => {
      const { selected, name, type } = card;
      if (selected && selected > 0) {
        if (type === 'privateMaid') {
          this.buyPrivateMaid(name);
        } else {
          card.selected = 0;
          card.quantity -= selected;
          this.updateCard(name, card, this.updatePeers);
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
    this.context.updateParent((prevState) => {
      const { city, privateMaids } = prevState;
      const cardBack = city.find((card) => card.name === 'cardback') || {};
      const newCity = city.filter((card) => card.name !== name);
      let newPrivateMaids = privateMaids;
      if (privateMaids[0]) {
        const backIndex = newCity.findIndex((card) => card.name === 'cardback');
        newCity[backIndex] = {
          ...cardBack,
          quantity: cardBack.quantity - 1,
        };
        newCity.push(privateMaids[0]);
        newPrivateMaids = privateMaids.filter((card, idx) => idx > 0);
      }
      return { city: newCity, privateMaids: newPrivateMaids };
    }, this.updatePeers);
  };

  updatePeers = () => {
    const { city, privateMaids, webrtc } = this.context.parentState;
    webrtc.shout('cityUpdate', { city, privateMaids });
  };

  // Esperar webrtc + 2s para enseñar el botón de join, el cual hace shout('cityQuery', '')

  render() {
    const { city } = this.context.parentState;
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
