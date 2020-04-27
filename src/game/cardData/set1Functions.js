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
  inst.setState((prevState) => {
    return {
      message: 'Selecciona cartas para descartar',
      button2Text: 'Hecho',
      button2Click: () => getServings(inst, prevState),
      handSelection: [],
      selectionOn: 2,
    };
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
  inst.setState({ ...prevMessages, handSelection: null, selectionOn: null });
}

function Tenalys(inst, card) {
  const { webrtc, playerName } = inst.context.parentState;
  if (webrtc) webrtc.shout('sendAction', { type: 'auto', card });
  inst.context.updateMessage(
    `${playerName} usa los servicios de TenalysTrent y los demás jugadores roban 1 carta.`
  );
}

function actionTenalys(inst) {
  inst.drawAndReload(1);
}

function Natsumi(inst, card) {
  inst.setState((prevState) => {
    return {
      message: 'Descarta, si quieres, 1 carta',
      button2Text: 'Hecho',
      button2Click: (a, b) => forcedDiscard(a, b, prevState, card),
      handSelection: [],
      selectionOn: 1,
    };
  });
}

function forcedDiscard(context, handSelection, prevMessages, card) {
  const discardIdx = handSelection[0];
  if (discardIdx >= 0) {
    const { hand } = context.playerState;
    context.updateParent((prevState) => {
      return { discard: [...prevState.discard, hand[discardIdx]] };
    });
    context.updatePlayer((prevState) => {
      const newHand = [...prevState.hand];
      return { hand: newHand.filter((foo, idx) => idx !== discardIdx) };
    });
    if (card) {
      const { webrtc, playerName } = context.parentState;
      if (webrtc) webrtc.shout('sendAction', { type: 'auto', card });
      context.updateMessage(
        `${playerName} descarta 1 carta con la habilidad de NatsumiFujikawa, lo que obliga a los demás jugadores a hacer lo mismo.`
      );
    }
  }
  if (discardIdx >= 0 || card)
    context.parentState.setActions({
      ...prevMessages,
      handSelection: null,
      selectionOn: null,
    });
}

function actionNatsumi(inst) {
  if (inst.state.hand.length >= 4) {
    inst.context.parentState.setActions((prevState) => {
      return {
        message: 'Descarta 1 carta',
        button2Text: 'Hecho',
        button2Click: (a, b) => forcedDiscard(a, b, prevState),
        handSelection: [],
        selectionOn: 1,
      };
    });
  }
}

export const playFuncs = {
  Sainsbury,
  Esquine,
  Tenalys,
  actionTenalys,
  Natsumi,
  actionNatsumi,
};
