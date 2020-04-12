import { set1Fixed, set1Maids } from '../cardData/set1';
import { privateMaids } from '../cardData/privateMaids';
import { love } from '../cardData/love';
import { shuffle } from '../helpers/actions';

export function initiateCity() {
  const privateMaidsDeck = shuffle(privateMaids);
  const city = [
    ...love,
    ...set1Fixed,
    ...shuffle(set1Maids).filter((item, idx) => idx < 10),
    { name: 'cardback', quantity: 8 },
    privateMaidsDeck[0],
    privateMaidsDeck[1],
  ];
  return {
    city,
    privateMaids: privateMaidsDeck.filter((item, idx) => idx >= 2),
  };
}
