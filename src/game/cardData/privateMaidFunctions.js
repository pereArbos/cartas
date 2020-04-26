import _ from 'lodash';

function Lucienne(context) {
  increaseParam(context, 'servings', 'Lucienne');
}

function Rosa(context) {
  increaseParam(context, 'love', 'Rosa');
}

function Fay(context) {
  context.parentState.setActions({
    message: 'Qué quieres obtener con FayLongfang ?',
    button1Text: '1 Amor',
    button2Text: '1 Contratación',
    button1Click: () => increaseParam(context, 'love', 'Fay'),
    button2Click: () => increaseParam(context, 'contract', 'Fay'),
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

function Lalande(context) {
  const { playerName } = context.parentState;
  context.draw(1);
  context.updateParent({ gameState: 'servingPhase' });
  context.updateMessage(
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

function Nord(context) {
  context.parentState.setActions((prevActions) => {
    return {
      message: 'Quieres usar la habilidad de Nord ?',
      button1Text: 'Sí',
      button1Click: () => selectHand(context, prevActions),
      button2Text: 'No',
      button2Click: () => context.parentState.setActions(prevActions),
    };
  });
}

function selectHand(context, prevActions) {
  context.parentState.setActions({
    message: 'Selecciona la carta a MANTENER',
    button1Text: null,
    button2Text: 'Hecho',
    button2Click: (a, b) => discardAndTarget(a, b, prevActions),
    handSelection: [],
    selectionOn: 1,
  });
}

function discardAndTarget(context, handSelection, prevActions) {
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
  context.updateParent({ city, gameState: 'servingPhase' });

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

export const functions = { Lucienne, Rosa, Fay, Lalande, Milly, Tanya, Nord };
