import _ from 'lodash';
import { getTrueData } from '../../../helpers/actions';

export function getChamberMaid(inst, mehCard, add = 1) {
  const card = getTrueData(mehCard);
  inst.setState((prevState) => {
    let newMaids = _.cloneDeep(prevState.chamberMaids);
    const idx = newMaids.findIndex((item) => {
      const hasAttachments = item.attachments && item.attachments[0];
      return !hasAttachments && item.name === card.name;
    });
    if (idx >= 0) {
      newMaids[idx].chambered = newMaids[idx].chambered + add;
      if (newMaids[idx].chambered <= 0) {
        newMaids = newMaids.filter((foo, i) => i !== idx);
      }
    } else {
      newMaids.push({ ...card, chambered: 1 });
    }
    return { chamberMaids: newMaids };
  });
  if (card.type !== 'event') {
    const { updateMessage, parentState } = inst.context;
    updateMessage(
      `${parentState.playerName} pone 1 ${card.name} como Doncella.`
    );
  }
}

export function getAttachment(inst, data) {
  const { maidIdx, isPrivate, remove } = data;
  let cards = data.card;
  if (!Array.isArray(cards)) cards = [data.card];
  if (!remove) cards = cards.map(getTrueData);
  if (isPrivate) {
    inst.setState((prevState) => {
      const privateMaids = _.cloneDeep(prevState.boughtPrivateMaids);
      const attachments = privateMaids[0] && privateMaids[0].attachments;
      privateMaids[0].attachments = addOrRemove(attachments, cards, remove);
      return { boughtPrivateMaids: privateMaids };
    });
    return;
  }
  inst.setState((prevState) => {
    let newMaids = _.cloneDeep(prevState.chamberMaids);
    const maid = newMaids[maidIdx];
    const attachments = addOrRemove(maid.attachments, cards, remove);
    // Quitar maid con antiguos attachments
    if (maid.chambered > 1) {
      newMaids[maidIdx].chambered -= 1;
    } else {
      newMaids = newMaids.filter((foo, idx) => idx !== maidIdx);
    }
    // Meter maid con nuevos attachments
    const newIdx = newMaids.findIndex((item) => {
      const same = hasSameAttachments(item.attachments, attachments);
      return item.name === maid.name && same;
    });
    if (newIdx >= 0) {
      newMaids[newIdx].chambered += 1;
    } else {
      newMaids.push({ ...maid, chambered: 1, attachments });
    }
    return { chamberMaids: newMaids };
  });
}

function addOrRemove(list, cards, remove) {
  if (remove) {
    return (list || []).filter((foo, idx) => idx < list.length - 1);
  }
  return [...(list || []), ...cards];
}

function hasSameAttachments(list1, list2) {
  const namelist1 = (list1 || []).map((item) => item.name);
  const namelist2 = (list2 || []).map((item) => item.name);
  return _.isEqual(namelist1, namelist2);
}

export function handSelect(inst, idx) {
  const limit = inst.state.selectionOn;
  inst.setState((prevState) => {
    let selection = [...prevState.handSelection];
    if (selection.find((item) => item === idx) >= 0) {
      selection = selection.filter((item) => item !== idx);
    } else if (selection.length < limit) selection.push(idx);
    return { handSelection: selection };
  });
}

export function getVP(inst) {
  const { discard } = inst.context.parentState;
  const { boughtPrivateMaids, chamberMaids } = inst.state;
  const hasPoints = (maid) => maid.vp && !inst.hasIllness(maid);
  const chamberCards = chamberMaids.filter(hasPoints);
  const privateMaids = boughtPrivateMaids.filter(hasPoints);
  const pointMaids = parseDiscard(discard);

  chamberCards.forEach((maid) => {
    const { name, chambered, vp } = maid;
    if (pointMaids[name]) {
      pointMaids[name].chambered = chambered;
    } else pointMaids[name] = { chambered, inDeck: 0, vp };
  });
  return getPrivatePoints(privateMaids) + getMaidPoints(inst, pointMaids);
}

function parseDiscard(list) {
  const result = {};
  list.forEach((card) => {
    const { name, vp } = card;
    if (vp) {
      if (result[name]) {
        result[name].inDeck += 1;
      } else {
        result[name] = { inDeck: 1, chambered: 0, vp };
      }
    }
  });
  return result;
}

function getPrivatePoints(maids) {
  const points = maids.map((card) => card.vp);
  return [0, ...points].reduce((a, b) => a + b);
}

function getMaidPoints(inst, maids) {
  const points = Object.keys(maids).map((name) => {
    const { vp, chambered, inDeck } = maids[name];
    return vp(chambered, inDeck, inst, maids);
  });
  return [0, ...points].reduce((a, b) => a + b);
}

export function getPlayerData(inst) {
  const { deck, discard } = inst.context.parentState;
  const { hand, playedCards } = inst.context.playerState;
  const { chamberMaids, boughtPrivateMaids } = inst.state;
  return { deck, discard, hand, playedCards, chamberMaids, boughtPrivateMaids };
}

export function setPlayerData(inst, data) {
  const { deck, discard, hand, playedCards } = data;
  inst.context.updateParent({
    deck: deck.map(getTrueData),
    discard: discard.map(getTrueData),
  });
  inst.context.updatePlayer({
    hand: hand.map(getTrueData),
    playedCards: playedCards.map(getTrueData),
  });
  inst.setState({
    chamberMaids: data.chamberMaids.map(parseChamberCard),
    boughtPrivateMaids: data.boughtPrivateMaids.map(parseChamberCard),
  });
}

function parseChamberCard(card) {
  const { attachments, chambered } = card;
  return {
    ...getTrueData(card),
    chambered,
    attachments: (attachments || []).map(getTrueData),
  };
}
