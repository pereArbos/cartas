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
            if (webrtc) webrtc.whisper(opp.peer, 'sendEvent', card);
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
    const left = [...prevState.attachmentsLeft].filter((foo, idx) => idx > 0);
    let data = { attachmentsLeft: left };
    if (left[0]) {
      data = { ...data, ...getAttachInfo(inst, left[0]) };
    } else data.gameState = 'discardPhase';
    return data;
  });
}
