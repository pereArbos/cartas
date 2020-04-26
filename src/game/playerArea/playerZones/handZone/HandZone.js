import React from 'react';
import PropTypes from 'prop-types';

import { config } from './playerActions';
import { handSelect } from '../helpers/dataUpdates';

export default class HandZone extends React.Component {
  static contextTypes = {
    playerState: PropTypes.object,
    updateImage: PropTypes.func,
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
    updatePlayer: PropTypes.func,
    draw: PropTypes.func,
    updateMessage: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { message: '', usadaJoder: 'no' };
  }

  componentDidMount() {
    this.context.updateParent({ setActions: (data) => this.setState(data) });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const newState = nextContext.parentState.gameState;
    const change = this.context.parentState.gameState !== newState;
    if (change && config[newState]) {
      this.setState({
        message: '',
        button1Text: null,
        button2Text: null,
        ...config[newState],
      });
    }
    const { attachmentsLeft } = nextContext.parentState;
    if (change && newState === 'targetPlayer' && attachmentsLeft[0]) {
      const { name } = attachmentsLeft[0];
      this.setState({ message: `Asigna ${name} a un Jugador` });
    }
    if (change && newState === 'targetChamberMaid' && attachmentsLeft[0]) {
      const { name } = attachmentsLeft[0];
      this.setState({ message: `Asigna ${name} a una Doncella` });
    }
    if (change && newState === 'startPhase') {
      this.setState({ usadaJoder: 'no' });
    }
  }

  button1 = () => this.state.button1Click(this.context);
  button2 = () =>
    this.state.button2Click(this.context, this.state.handSelection);

  getCardPlay = (card, idx) => {
    const { selectionOn, button1Text } = this.state;
    if (selectionOn) return () => handSelect(this, idx);
    if (button1Text) return null;

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
    this.setState(prevState, () => func(card, idx));
  };

  cardPlay = (card, cardIdx) => {
    const { love = 0, servings = 0, contract = 0, onPlay } = card;
    if (card.draw > 0) {
      this.draw(card.draw, () => {
        if (typeof onPlay === 'function') onPlay(this);
      });
    } else if (typeof onPlay === 'function') onPlay(this);
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

  draw = (amount, cb) => {
    this.context.draw(amount);
    const currentMaid = this.context.parentState.getCurrentMaid();
    if (currentMaid && currentMaid.onDraw && this.state.usadaJoder === 'no') {
      currentMaid.onDraw(this, cb);
    } else cb();
  };

  render() {
    const { hand } = this.context.playerState;
    const { message, handSelection, button1Text, button1Click } = this.state;
    const { button2Text, button2Click } = this.state;
    const space = 0.9;

    return (
      <div className="HandZone">
        <h6>{message}</h6>
        <div className="handCards">
          {hand.map((card, idx, list) => {
            const { name, set } = card;
            const play = this.getCardPlay(card, idx);
            const selected = handSelection && handSelection.includes(idx);
            const route = set ? `set${set}/${name}` : name;
            return (
              <img
                alt="noseve"
                src={require(`../../../cards/${route}.jpg`)}
                className={`${play ? 'playable' : ''} ${
                  selected ? 'selected' : ''
                }`}
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
