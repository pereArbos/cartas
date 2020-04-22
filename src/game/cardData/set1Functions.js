import _ from 'lodash';

function Sainsbury(inst) {
  const { hand } = inst.context.playerState;
  const loveIdx = hand.findIndex((card) => card.name === '1Love');
  if (loveIdx < 0) return;

  inst.setState({ message: 'Elige una maid o 2Love', button2Text: null });
  inst.context.updateParent({
    gameState: 'cityPick',
    money: {
      love: 4,
      contract: 1,
    },
    restrType: ['maidChief', 'event', 'privateMaid'],
    restrName: ['1Love', '3Love'],
    sendTo: (cards) => sendToHand(inst, cards, loveIdx),
  });
}

function sendToHand(inst, cards, loveIdx) {
  inst.context.updatePlayer((prevState) => {
    const hand = [...prevState.hand];
    hand.push(...cards);
    return { hand: hand.filter((foo, idx) => idx !== loveIdx) };
  });
  inst.context.updateParent((prevState) => {
    const city = _.cloneDeep(prevState.city);
    const idx = city.findIndex((item) => item.name === '1Love');
    city[idx].quantity += 1;
    return { gameState: 'servingPhase', city };
  }); //meter 1Love a la ciudad y evitar reset de servings etc
}

export const playFuncs = { Sainsbury };
