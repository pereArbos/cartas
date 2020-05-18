import { love } from '../cardData/love';
import { set1Fixed, set1Maids } from '../cardData/set1';
import { privateMaids } from '../cardData/privateMaids';

export function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function getTrueData(card) {
  if (!card) return null;
  switch (card.type) {
    case 'love':
      return love.find((item) => item.name === card.name);
    case 'privateMaid':
      return privateMaids.find((item) => item.name === card.name);
    case 'maid':
      return set1Maids.find((item) => item.name === card.name);
    default:
      return set1Fixed.find((item) => item.name === card.name);
  }
}

export function checkChamberMaids(data) {
  const { chamberMaids, boughtPrivateMaids } = data;
  return (
    boughtPrivateMaids[0] ||
    chamberMaids.find((maid) => maid.type.includes('maid'))
  );
}

export function hasTargets(context) {
  if (context.parentState.hasChamberMaids()) return true;
  return context.parentState.opponents.find((opp) => {
    return checkChamberMaids(opp.data);
  });
}

export function attachEvent(inst, card, selected) {
  inst.setState((prevState) => {
    let data = {
      attachmentsLeft: [...prevState.attachmentsLeft],
    };
    if (data.attachmentsLeft.length === 0) {
      data = { ...data, ...getAttachInfo(inst, card) };
    }
    for (let i = 0; i < selected; i++) {
      data.attachmentsLeft.push(card);
    }
    return data;
  });
}

export function getAttachInfo(inst, card) {
  switch (card.attachTo) {
    case 'maid':
      return {
        gameState: 'targetChamberMaid',
        maidClick: (maidIdx, isPrivate, oppName) => {
          removePendingAttach(inst);
          const { webrtc, opponents, playerName } = inst.state;
          if (oppName) {
            const opp = opponents.find((item) => item.name === oppName);
            const data = { maidIdx, card, isPrivate };
            if (webrtc) webrtc.whisper(opp.peer, 'sendAttach', data);
          } else inst.state.getAttachment({ maidIdx, card, isPrivate });
          inst.updateMessage(
            `${playerName} envía 1 ${card.name} a ${oppName || playerName}.`
          );
        },
      };
    default:
      return {
        gameState: 'targetPlayer',
        playerClick: (name) => {
          removePendingAttach(inst);
          const { webrtc, opponents, playerName } = inst.state;
          if (name) {
            const opp = opponents.find((item) => item.name === name);
            if (webrtc) webrtc.whisper(opp.peer, 'sendEvent', [card]);
          } else inst.state.getChamberMaid(card);
          inst.updateMessage(
            `${playerName} envía 1 ${card.name} a ${name || playerName}.`
          );
        },
      };
  }
}

function removePendingAttach(inst) {
  inst.setState((prevState) => {
    const removed = prevState.attachmentsLeft[0];
    const left = [...prevState.attachmentsLeft].filter((foo, idx) => idx > 0);
    let data = { attachmentsLeft: left };
    if (left[0]) {
      data = { ...data, ...getAttachInfo(inst, left[0]) };
    } else if (removed.backToStart) {
      data.gameState = 'startPhase';
    } else data.gameState = 'discardPhase';
    return data;
  });
}

export function handleAction(data, inst) {
  if (data.type === 'auto') {
    getTrueData(data.card).forcedAction(inst, ...(data.funcData || []));
  }
}

export function getTurnOrder(context) {
  const { opponents, playerName, webrtc } = context.parentState;
  const players = opponents.map((opp) => opp.name);
  players.push(playerName);
  const turnOrder = shuffle(players);
  let message = 'El orden de juego es:';
  turnOrder.forEach((name, idx) => {
    message = `${message} ${idx > 0 ? '-> ' : ''}${name}`;
  });
  if (webrtc) {
    webrtc.shout('turnOrder', turnOrder);
    context.updateMessage(message);
    context.updateParent({
      msgTitle: `Turno de ${turnOrder[0]}`,
      turnNum: 0,
      gameState: turnOrder[0] === playerName ? 'startPhase' : 'opponentTurn',
      turnOrder,
    });
  }
}

export function finishTurn(context) {
  const { webrtc, turnOrder, turnNum, playerName } = context.parentState;
  if (webrtc) {
    webrtc.shout('newTurn', { turnNum: turnNum + 1 });
    setTimeout(() => webrtc.shout('newTurn', { turnNum: turnNum + 1 }), 500);
  }
  const newTurn = turnOrder[(turnNum + 1) % turnOrder.length];
  context.updateParent(
    {
      msgTitle: `Turno de ${newTurn}`,
      turnNum: turnNum + 1,
      gameState: newTurn === playerName ? 'startPhase' : 'opponentTurn',
    },
    context.parentState.checkGameFinish
  );
}

export function checkGameFinish(inst) {
  const { city } = inst.context.parentState;
  let soldOut = 0;
  city.forEach((item) => {
    const { type, name, quantity } = item;
    const validCard = name === 'cardback' || (type || '').includes('maid');
    if (validCard && quantity === 0) soldOut += 1;
  });
  if (soldOut >= 2) {
    finishGame(inst);
  }
}

function finishGame(inst) {
  const { playedCards, hand } = inst.state;
  inst.context.updateParent(
    (prevState) => {
      const { deck, discard } = prevState;
      return {
        discard: [...discard, ...deck, ...hand, ...playedCards],
        deck: [],
        gameState: 'gameEnded',
        msgTitle: 'Fin de la Partida',
        message: "Pulsa 'Resultados' para ver la clasificación.",
      };
    },
    () => setTimeout(inst.context.parentState.getResults, 1000)
  );
  inst.setState({ playedCards: [], hand: [] });
}
