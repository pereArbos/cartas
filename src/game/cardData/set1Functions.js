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
  });
  const { playerName } = inst.context.parentState;
  inst.context.updateMessage(
    `Con los servicios de Sainsbury, ${playerName} intercambia un 1Love de su mano por 1 ${cards[0].name} de la ciudad.`
  );
}

function Esquine(inst) {
  let prevMessages = {};
  inst.setState((prevState) => {
    prevMessages = prevState;
    return {
      message: 'Selecciona cartas para descartar',
      button2Text: 'Hecho',
      button2Click: () => getServings(inst, prevMessages),
      handSelection: [],
      cardOnClick: (idx) => selectCard(inst, idx),
    };
  });
}

function selectCard(inst, idx) {
  inst.setState((prevState) => {
    let selection = [...prevState.handSelection];
    if (selection.find((item) => item === idx)) {
      selection = selection.filter((item) => item !== idx);
    } else if (selection.length < 2) selection.push(idx);
    return { handSelection: selection };
  });
}

function getServings(inst, prevMessages) {
  const { handSelection } = inst.state;
  const { hand } = inst.context.playerState;
  inst.context.updateParent((prevState) => {
    const discard = [...prevState.discard];
    handSelection.forEach((idx) => discard.push(hand[idx]));
    return { discard };
  });
  inst.context.updatePlayer((prevState) => {
    const newHand = [...prevState.hand];
    return {
      servings: prevState.servings + handSelection.length,
      hand: newHand.filter((foo, idx) => !handSelection.includes(idx)),
    };
  });
  inst.setState({ ...prevMessages, handSelection: null, cardOnClick: null });
}

export const playFuncs = { Sainsbury, Esquine };
