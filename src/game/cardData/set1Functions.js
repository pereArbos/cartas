import _ from 'lodash';
import { getAttachment } from '../playerArea/playerZones/helpers/dataUpdates';
import { checkChamberMaids } from '../helpers/actions';

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

function Claire(inst) {
  inst.context.parentState.setActions({
    message: 'Elige 1 Illness para devolverla a la ciudad',
    button2Text: 'Cancelar',
    button2Click: () =>
      inst.context.updateParent({
        gameState: 'servingPhase',
      }),
  });
  inst.context.updateParent({
    gameState: 'targetIllness',
    illnessClick: healIllnes,
  });
}

function ClaireDefend(inst, data) {
  const { maidIdx, isPrivate, remove } = data;
  if (!remove) {
    const message = 'se defiende de la Illness revelando 1 Claire de su mano';
    inst.context.parentState.setActions((prevActions) => {
      return {
        message: 'Quieres defenderte de la Illness con Claire ?',
        button1Text: 'Sí',
        button1Click: () => {
          healIllnes(inst, maidIdx, isPrivate, message);
          inst.context.parentState.setActions(prevActions);
        },
        button2Text: 'No',
        button2Click: () => inst.context.parentState.setActions(prevActions),
      };
    });
  }
}

function healIllnes(inst, maidIdx, isPrivate, message) {
  const { playerName, webrtc } = inst.context.parentState;
  inst.context.updateParent((prevState) => {
    const city = _.cloneDeep(prevState.city);
    const illIdx = city.findIndex((item) => item.name === 'Illness');
    city[illIdx].quantity += 1;
    if (webrtc) webrtc.shout('cityUpdate', { city });
    return { city, gameState: 'servingPhase' };
  });
  getAttachment(inst, { maidIdx, isPrivate, remove: true });
  inst.context.updateMessage(
    `${playerName} ${
      message ||
      'usa los servicios de Claire para devolver 1 de sus Illness a la ciudad'
    }`
  );
}

function Eliza(inst, card) {
  inst.setState({
    message: 'Elige un jugador para el efecto',
    button2Text: null,
  });
  inst.context.updateParent({
    gameState: 'targetPlayer',
    playerClick: (name) => getSCModal(inst, name, card),
    freeChambersToo: true,
  });
}

function getSCModal(inst, oppName, card) {
  const { webrtc, playerName, opponents } = inst.context.parentState;
  const opp = opponents.find((item) => item.name === oppName);
  const { deck } = oppName ? opp.data : inst.context.parentState;
  if (!deck[0]) {
    ElizaFinish(inst);
    return;
  }
  const { name, set } = deck[0];
  const route = set ? `set${set}/${name}` : name;

  inst.context.updateParent({
    showSCModal: true,
    scModalData: {
      title: `Esta es la primera carta de${
        oppName ? `l mazo de ${oppName}` : ' tu mazo'
      }`,
      message: 'Quieres descartarla ?',
      imgRoute: route,
      yesFunc: () => {
        ElizaFinish(inst);
        if (oppName) {
          if (webrtc)
            webrtc.whisper(opp.peer, 'sendAction', { type: 'auto', card });
        } else {
          inst.context.draw(1, (hand) => {
            const discarded = hand[0];
            inst.context.updatePlayer({
              hand: hand.filter((foo, idx) => idx > 0),
            });
            inst.context.updateParent((prevState) => {
              return { discard: [...prevState.discard, discarded] };
            });
          });
        }
        inst.context.updateMessage(
          `${playerName} usa los servicios de Eliza para descartar 1 carta del mazo de ${
            oppName || playerName
          }`
        );
      },
      noFunc: () => ElizaFinish(inst),
    },
  });
}

function ElizaFinish(inst) {
  inst.context.updateParent({
    gameState: 'servingPhase',
    freeChambersToo: false,
    playerClick: null,
    showSCModal: false,
  });
}

function ElizaDiscard(inst) {
  inst.drawAndReload(1, (hand) => {
    const discarded = hand[0];
    inst.setState({ hand: hand.filter((foo, idx) => idx > 0) });
    inst.context.updateParent((prevState) => {
      return { discard: [...prevState.discard, discarded] };
    });
  });
}

function Nena(inst) {
  const { webrtc, playerName, opponents, turnOrder } = inst.context.parentState;
  const playerIdx = inst.context.parentState.turnNum % turnOrder.length;
  const city = _.cloneDeep(inst.context.parentState.city);
  const bhIdx = city.findIndex((item) => item.name === 'BadHabit');
  const bhLeft = city[bhIdx].quantity;
  let message = null;
  if (bhLeft > 0) {
    const opp1 = opponents.find(
      (opp) => opp.name === turnOrder[(playerIdx + 1) % turnOrder.length]
    );
    if (checkChamberMaids(opp1.data)) {
      city[bhIdx].quantity -= 1;
      if (webrtc) webrtc.whisper(opp1.peer, 'sendEvent', [city[bhIdx]]);
      message = `${playerName} usa los servicios de NenaWilder para enviar 1 BadHabit a ${opp1.name}`;
    }
  }
  if (bhLeft > 1) {
    const opp2 = opponents.find(
      (opp) =>
        opp.name ===
        turnOrder[(playerIdx + turnOrder.length - 1) % turnOrder.length]
    );
    if (checkChamberMaids(opp2.data)) {
      city[bhIdx].quantity -= 1;
      if (webrtc) webrtc.whisper(opp2.peer, 'sendEvent', [city[bhIdx]]);
      message = message
        ? `${message} y a ${opp2.name}`
        : `${playerName} usa los servicios de NenaWilder para enviar 1 BadHabit a ${opp2.name}`;
    }
  }
  if (message) {
    inst.context.updateParent({ city });
    webrtc.shout('cityUpdate', { city });
    inst.context.updateMessage(message);
  }
}

export const playFuncs = {
  Sainsbury,
  Esquine,
  Tenalys,
  actionTenalys,
  Natsumi,
  actionNatsumi,
  Claire,
  ClaireDefend,
  Eliza,
  ElizaDiscard,
  Nena,
};
