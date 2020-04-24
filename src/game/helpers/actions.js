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
