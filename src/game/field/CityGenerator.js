import { set1Fixed, set1Maids } from '../cardData/set1';
import { love } from '../cardData/love';
import { shuffle } from '../helpers/actions';

export function getCity() {
  return [
    ...love,
    ...set1Fixed,
    ...shuffle(set1Maids).filter((item, idx) => idx < 10),
    { name: 'cardback', quantity: 8 },
    { name: 'FayLongfang', set: 1 },
    { name: 'FayLongfang', set: 1 },
  ];
}
