import _ from 'lodash';
import { getAttachment } from '../playerArea/playerZones/helpers/dataUpdates';

function Illness(inst, maidIdx, isPrivate) {
  const hand = _.cloneDeep(inst.context.playerState.hand);
  const loveIdx = hand.findIndex((item) => item.name === '3Love');
  const threeLove = hand[loveIdx];
  inst.context.updatePlayer({
    hand: hand.filter((foo, idx) => idx !== loveIdx),
  });
  const { webrtc, playerName } = inst.context.parentState;
  inst.context.updateParent((prevState) => {
    const city = _.cloneDeep(prevState.city);
    const illIdx = city.findIndex((item) => item.name === 'Illness');
    city[illIdx].quantity += 1;
    if (webrtc) webrtc.shout('cityUpdate', { city });

    const discard = [...prevState.discard];
    discard.push(threeLove);
    return { discard, city };
  });
  getAttachment(inst, { maidIdx, isPrivate, remove: true });
  inst.context.updateMessage(
    `En su fase de Inicio, ${playerName} descarta un 3Love para devolver 1 de sus Illness a la ciudad.`
  );
}

function restricIllness(context) {
  return context.playerState.hand.find((card) => card.name === '3Love');
}

export const eventFuncs = { Illness, restricIllness };
