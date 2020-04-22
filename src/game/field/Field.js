import React from 'react';
import PropTypes from 'prop-types';
import './Field.css';

import CardBlock from './CardBlock';

export default class Field extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
    attachEvent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { lovePaid: 0, cardsOrdered: 0 };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { getDeck } = this.context.parentState;
    if (!getDeck && nextContext.parentState.getDeck) {
      this.buyCards(null, nextContext.parentState.sendTo);
    }
  }

  updateCard = (name, newCard, cb) => {
    this.context.updateParent((prevState) => {
      const { city } = prevState;
      const index = city.findIndex((card) => card.name === name);
      city[index] = newCard;
      return { city };
    }, cb);
  };

  selectCard = (card, mode = 'new') => {
    if (!card) return;
    switch (mode) {
      case 'plus':
        card.selected += 1;
        this.switchCard(card, 1);
        break;
      case 'minus':
        card.selected -= 1;
        this.switchCard(card, -1);
        break;
      default:
        if (card.quantity !== 0 && !this.privateSelectedTwice(card)) {
          if (!card.selected || card.selected < 1) {
            card.selected = 1;
            this.switchCard(card, 1);
          }
        }
    }
    this.updateCard(card.name, card);
  };

  switchCard = (card, sign) => {
    this.setState((prevState) => {
      const { lovePaid, cardsOrdered } = prevState;
      return {
        lovePaid: lovePaid + sign * card.cost,
        cardsOrdered: cardsOrdered + sign,
      };
    });
  };

  privateSelectedTwice = (card) => {
    const index = this.context.parentState.city.findIndex((item) => {
      return item.selected >= 1 && item.type === 'privateMaid';
    });
    return index >= 0 && card.type === 'privateMaid';
  };

  buyCards = (event, sendToFunc) => {
    const boughtCards = [];
    let hasEvents = false;
    this.context.parentState.city.forEach((card) => {
      const { selected, name, type } = card;
      if (selected && selected > 0) {
        if (type === 'privateMaid') {
          this.buyPrivateMaid(name);
          this.context.parentState.getPrivateMaid(card);
        } else {
          card.selected = 0;
          card.quantity -= selected;
          this.updateCard(name, card, !sendToFunc && this.updatePeers);
          if (type === 'event') {
            hasEvents = true;
            this.context.attachEvent(card, selected);
          } else {
            for (let i = 0; i < selected; i++) {
              boughtCards.push(card);
            }
          }
        }
      }
    });
    const useSendTo = typeof sendToFunc === 'function';
    const sendFunc = useSendTo ? sendToFunc : this.sendToDiscard;

    sendFunc(boughtCards);
    this.setState({ lovePaid: 0, cardsOrdered: 0 });

    if (!hasEvents && !sendToFunc)
      this.context.updateParent({ gameState: 'discardPhase' });
  };

  sendToDiscard = (cards) => {
    this.context.updateParent((prevState) => {
      const newDiscard = [...prevState.discard];
      newDiscard.push(...cards);
      return { discard: newDiscard };
    });
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

  isSelectable = (card) => {
    const { cost, name, type } = card;
    if (name === 'cardback') return false;

    const { gameState, restrType, restrName, money } = this.context.parentState;
    const picking = gameState === 'cityPick';
    if (picking && restrType.includes(type)) return false;
    if (picking && restrName.includes(name)) return false;

    const { love, contract } = money;
    const { lovePaid, cardsOrdered } = this.state;
    return love >= cost + lovePaid && contract > cardsOrdered;
  };

  updatePeers = () => {
    const { city, privateMaids, webrtc } = this.context.parentState;
    if (webrtc) webrtc.shout('cityUpdate', { city, privateMaids });
  };

  // Esperar webrtc + 2s para enseñar el botón de join, el cual hace shout('cityQuery', '')

  render() {
    const { city, gameState, sendTo } = this.context.parentState;
    const picking = gameState === 'cityPick';
    const buying = gameState === 'contractPhase' || picking;

    return (
      <div className="Field">
        <div style={{ float: 'left' }}>
          {city &&
            city.map((item) => (
              <CardBlock
                card={item}
                selectCard={this.selectCard}
                selectable={buying && this.isSelectable(item)}
              />
            ))}
          {buying && (
            <button
              type="button"
              style={{ marginLeft: '2vw' }}
              onClick={() => this.buyCards(null, picking ? sendTo : null)}
            >
              Hecho
            </button>
          )}
        </div>
      </div>
    );
  }
}
