import React from 'react';
import PropTypes from 'prop-types';

import { config } from './playerActions';

export default class HandZone extends React.Component {
  static contextTypes = {
    playerState: PropTypes.object,
    updateImage: PropTypes.func,
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
    updatePlayer: PropTypes.func,
    draw: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { message: '' };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const oldState = this.context.parentState.gameState;
    const newState = nextContext.parentState.gameState;
    if (oldState !== newState && config[newState]) {
      this.setState({
        message: '',
        button1Text: null,
        button2Text: null,
        ...config[newState],
      });
    }
  }

  button1 = () => this.state.button1Click(this.context);
  button2 = () => this.state.button2Click(this.context);

  getCardPlay = (card, idx) => {
    const { servings } = this.context.playerState;
    const { type, chamberCost } = card;
    if (chamberCost && servings >= chamberCost) {
      if (type === 'maid' && servings > 0) {
        return () => {
          this.setState((prevState) => {
            const data = { prevState, card, idx };
            return {
              message: `Qué quieres hacer con ${card.name} ?`,
              button1Text: 'Jugarla',
              button2Text: 'Poner como Doncella',
              button1Click: () => this.msgButton(data, this.cardPlay),
              button2Click: () => this.msgButton(data, this.cardChamber),
            };
          });
        };
      }
      return () => this.cardChamber(card, idx);
    } else if (type === 'maid' && servings > 0) {
      return () => this.cardPlay(card, idx);
    }
    return null;
  };

  msgButton = (data, func) => {
    const { prevState, card, idx } = data;
    func(card, idx);
    this.setState(prevState);
  };

  cardPlay = (card, cardIdx) => {
    const { love = 0, servings = 0, contract = 0 } = card;
    if (card.draw > 0) this.context.draw(card.draw);
    this.context.updatePlayer((prevState) => {
      const hand = [...prevState.hand];
      const playedCards = [...prevState.playedCards];
      playedCards.push(card);
      return {
        love: prevState.love + love,
        servings: prevState.servings + servings - 1,
        contract: prevState.contract + contract,
        hand: hand.filter((foo, idx) => idx !== cardIdx),
        playedCards,
      };
    });
  };

  cardChamber = (card, cardIdx) => {
    this.context.updatePlayer((prevState) => {
      const hand = [...prevState.hand].filter((foo, idx) => idx !== cardIdx);
      return { servings: prevState.servings - card.chamberCost, hand };
    });
    this.context.parentState.getChamberMaid(card);
  };

  render() {
    const { hand } = this.context.playerState;
    const { message, button1Text, button1Click } = this.state;
    const { button2Text, button2Click } = this.state;
    const space = 0.9;

    return (
      <div className="HandZone">
        <h6>{message}</h6>
        <div className="handCards">
          {hand.map((card, idx, list) => {
            const { name, set } = card;
            const play = this.getCardPlay(card, idx);
            const route = set ? `set${set}/${name}` : name;
            return (
              <img
                alt="noseve"
                src={require(`../../../cards/${route}.jpg`)}
                className={play ? 'playable' : ''}
                onMouseOver={() => {
                  this.context.updateImage(route);
                }}
                onMouseOut={() => {
                  this.context.updateImage(null);
                }}
                onClick={typeof play === 'function' ? play : () => {}}
                style={{
                  left: `${8.9 + space * 2 * idx - space * list.length}vw`,
                  zIndex: list.length - idx,
                }}
              />
            );
          })}
        </div>
        {button1Text && button1Click && (
          <button type="button" style={{ left: '5px' }} onClick={this.button1}>
            {button1Text}
          </button>
        )}
        {button2Text && button2Click && (
          <button type="button" style={{ right: '5px' }} onClick={this.button2}>
            {button2Text}
          </button>
        )}
      </div>
    );
  }
}
