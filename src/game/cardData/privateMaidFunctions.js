import _ from 'lodash';
import {
  getAttachment,
  getChamberMaid,
} from '../playerArea/playerZones/helpers/dataUpdates';
import { getTrueData, finishTurn } from '../helpers/actions';

function Lucienne(context) {
  const noUpdate = context.parentState.hasPlayables();
  increaseParam(context, 'servings', 'Lucienne', noUpdate);
}

function Rosa(context) {
  const noUpdate = context.parentState.hasPlayables();
  increaseParam(context, 'love', 'Rosa', noUpdate);
}

function Fay(context) {
  const noUpdate = context.parentState.hasPlayables();
  context.parentState.setActions((prevActions) => {
    return {
      message: 'Qué quieres obtener con FayLongfang ?',
      button1Text: '1 Amor',
      button2Text: '1 Contratación',
      button1Click: () => {
        context.parentState.setActions(prevActions);
        increaseParam(context, 'love', 'Fay', noUpdate);
      },
      button2Click: () => {
        context.parentState.setActions(prevActions);
        increaseParam(context, 'contract', 'Fay', noUpdate);
      },
    };
  });
}

function increaseParam(context, param, name, noUpdate) {
  context.updatePlayer((prevState) => {
    return { [param]: prevState[param] + 1 };
  });
  if (!noUpdate) context.updateParent({ gameState: 'servingPhase' });
  const { playerName } = context.parentState;
  context.updateMessage(
    `${
      noUpdate ? 'Al robar una carta' : 'En su fase de Inicio'
    }, ${playerName} gana 1 &${param}& con la habilidad de ${name}.`
  );
}

function Lalande(inst) {
  const { playerName } = inst.context.parentState;
  inst.context.draw(1);
  inst.setState({ usadaJoder: 'si' });
  if (!inst.context.parentState.hasPlayables())
    inst.context.updateParent({ gameState: 'servingPhase' });
  inst.context.updateMessage(
    `En su fase de Inicio, ${playerName} roba 1 carta con la habilidad de Lalande.`
  );
}

function Milly(inst, cb) {
  inst.setState({ usadaJoder: 'si' });
  increaseParam(inst.context, 'servings', 'Milly', true);
  cb();
}

function Tanya(inst, cb) {
  inst.setState((prevState) => {
    return {
      message: 'Robas 1 más con TanyaPetrushka ?',
      button1Text: 'Sí',
      button2Text: 'No',
      button1Click: () => {
        inst.context.draw(1);
        inst.setState({ ...prevState, usadaJoder: 'si' }, cb);
        const { updateMessage, parentState } = inst.context;
        updateMessage(
          `Al robar una carta, ${parentState.playerName} roba otra carta con la habilidad de Tanya.`
        );
      },
      button2Click: () => inst.setState(prevState, cb),
    };
  });
}

function Nord(inst) {
  inst.setState({ usadaJoder: 'si' });
  inst.context.parentState.setActions((prevActions) => {
    return {
      message: 'Quieres usar la habilidad de Nord ?',
      button1Text: 'Sí',
      button1Click: () => selectHand(inst.context),
      button2Text: 'No',
      button2Click: () => inst.context.parentState.setActions(prevActions),
    };
  });
}

function selectHand(context) {
  context.parentState.setActions({
    message: 'Selecciona la carta a MANTENER',
    button1Text: null,
    button2Text: 'Hecho',
    button2Click: (a, b) => discardAndTarget(a, b),
    handSelection: [],
    selectionOn: 1,
  });
}

function discardAndTarget(context, handSelection) {
  const newDiscards = context.playerState.hand.filter(
    (foo, idx) => idx !== handSelection[0]
  );
  context.parentState.setActions({
    message: 'Asigna 2 Illness a una Doncella',
    button2Text: null,
    handSelection: null,
    selectionOn: null,
  });
  context.updatePlayer((prevState) => {
    const hand = [...prevState.hand];
    return { hand: hand.filter((foo, idx) => idx === handSelection[0]) };
  });
  context.updateParent((prevState) => {
    const discard = [...prevState.discard];
    discard.push(...newDiscards);
    return {
      discard,
      gameState: 'targetChamberMaid',
      maidClick: (a, b, c) => sendIllness(context, a, b, c),
    };
  });
}

function sendIllness(context, maidIdx, isPrivate, oppName) {
  const city = _.cloneDeep(context.parentState.city);
  const illIdx = city.findIndex((item) => item.name === 'Illness');
  const numIll = Math.min(city[illIdx].quantity, 2);
  const card = [];
  if (numIll > 0) card.push(city[illIdx]);
  if (numIll > 1) card.push(city[illIdx]);

  city[illIdx].quantity -= numIll;
  context.updateParent({ city, gameState: 'startPhase' });

  const { webrtc, opponents, playerName } = context.parentState;
  webrtc.shout('cityUpdate', { city });
  const data = { maidIdx, card, isPrivate, count: numIll };
  if (oppName) {
    const opp = opponents.find((item) => item.name === oppName);
    if (webrtc) webrtc.whisper(opp.peer, 'sendAttach', data);
  } else context.parentState.getAttachment({ maidIdx, card, isPrivate });
  context.updateMessage(
    `${playerName} envía ${numIll} Illness a una Doncella de ${
      oppName || playerName
    }.`
  );
}

function Sora(inst) {
  inst.context.parentState.setActions({
    message: 'Elige el Evento que quieras mover',
    button2Text: 'Cancelar',
    button2Click: () =>
      inst.context.updateParent({
        gameState: 'startPhase',
        eventClick: null,
      }),
  });
  inst.context.updateParent({
    gameState: 'targetEvent',
    eventClick: (a, b, c, d) => removeAndTarget(inst, a, b, c, d),
  });
  inst.setState({ usadaJoder: 'si' });
}

function removeAndTarget(inst, card, idx, isPrivate, oppName) {
  const { webrtc, opponents, playerName } = inst.context.parentState;
  if (!oppName) {
    if (card.name === 'Illness') {
      // if is attachment
      getAttachment(inst, { maidIdx: idx, isPrivate, remove: true });
    } else getChamberMaid(inst, card, -1);
  } else {
    const opp = opponents.find((item) => item.name === oppName);
    if (card.name === 'Illness') {
      const data = { maidIdx: idx, isPrivate, remove: true };
      if (webrtc) webrtc.whisper(opp.peer, 'sendAttach', data);
    } else if (webrtc) {
      webrtc.whisper(opp.peer, 'sendEvent', [card, -1]);
    }
  }
  inst.context.updateParent({ eventClick: null });
  inst.context.attachEvent({ ...card, backToStart: true }, 1);
  inst.context.updateMessage(
    `En su fase de Inicio, ${playerName} toma 1 ${
      card.name
    } de la habitación de ${
      oppName || playerName
    } para enviarlo a otro jugador.`
  );
}

function Amber(context) {
  context.draw(1, (hand) => {
    const discarded = hand[0];
    context.updatePlayer({ hand: [] });
    context.updateParent((prevState) => {
      return { discard: [...prevState.discard, discarded] };
    });
    const amount = discarded.type.includes('maid') ? 5 : 4;
    context.draw(amount, () => finishTurn(context));
    const { playerName } = context.parentState;
    context.updateMessage(
      `Debido a la habilidad de AmberTwilight, ${playerName} descarta ${
        discarded.name
      } de su mazo.${
        amount === 4
          ? ' Como no es una Maid, roba 1 carta menos para su nueva mano.'
          : ''
      }`
    );
  });
}

function Eugenie(inst) {
  inst.setState({ usadaJoder: 'si' });
  inst.context.parentState.setActions({
    message: 'Elige un oponente para el efecto',
    button2Text: null,
  });
  inst.context.updateParent({
    gameState: 'targetPlayer',
    playerClick: (name) => getModal(inst, name),
    freeChambersToo: true,
  });
}

function getModal(inst, oppName) {
  if (!oppName) return;
  const { webrtc, playerName, opponents } = inst.context.parentState;
  const opp = opponents.find((item) => item.name === oppName);
  const oppRandom = getHandRandom(opp.data.hand);
  const { name, set } = oppRandom.card;
  const route = set ? `set${set}/${name}` : name;

  inst.context.updateParent({
    showSCModal: true,
    scModalData: {
      title: `Esta es la carta revelada de la mano de ${oppName}`,
      message: 'Quieres intercambiarla con una carta aleatoria de tu mano ?',
      imgRoute: route,
      yesFunc: () => {
        const playerRandom = getHandRandom(inst.context.playerState.hand);
        inst.context.updatePlayer((prevState) => {
          const hand = _.cloneDeep(prevState.hand);
          hand[playerRandom.idx] = getTrueData(oppRandom.card);
          return { hand };
        });
        if (webrtc) {
          webrtc.whisper(opp.peer, 'sendAction', {
            type: 'auto',
            card: {
              name: 'EugenieFontaine',
              set: 1,
              type: 'privateMaid',
            },
            funcData: [oppRandom.idx, playerRandom.card],
          });
        }
        inst.context.updateMessage(
          `En su fase de Inicio, ${playerName} usa la habilidad de Eugenie para intercambiar una carta aleatoria de su mano con ${oppName}`
        );
        EugenieFinish(inst);
      },
      noFunc: () => EugenieFinish(inst),
    },
  });
}

function actionEugenie(inst, idx, newCard) {
  inst.setState((prevState) => {
    const hand = _.cloneDeep(prevState.hand);
    hand[idx] = getTrueData(newCard);
    return { hand };
  });
}

function getHandRandom(hand) {
  const idx = Math.floor(Math.random() * hand.length);
  return { idx, card: hand[idx] };
}

function EugenieFinish(inst) {
  inst.context.updateParent({
    gameState: 'startPhase',
    freeChambersToo: false,
    playerClick: null,
    showSCModal: false,
  });
}

export const functions = {
  Lucienne,
  Rosa,
  Fay,
  Lalande,
  Milly,
  Tanya,
  Nord,
  Sora,
  Amber,
  Eugenie,
  actionEugenie,
};
