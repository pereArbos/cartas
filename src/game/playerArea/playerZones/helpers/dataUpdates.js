import _ from 'lodash';

export function getChamberMaid(inst, card) {
  inst.setState((prevState) => {
    const newMaids = _.cloneDeep(prevState.chamberMaids);
    const idx = newMaids.findIndex((item) => {
      const hasAttachments = item.attachments && item.attachments[0];
      return !hasAttachments && item.name === card.name;
    });
    if (idx >= 0) {
      newMaids[idx].chambered = newMaids[idx].chambered + 1;
    } else {
      newMaids.push({ ...card, chambered: 1 });
    }
    return { chamberMaids: newMaids };
  });
}

export function getAttachment(inst, data) {
  const { maidIdx, card, isPrivate } = data;
  if (isPrivate) {
    inst.setState((prevState) => {
      const privateMaids = _.cloneDeep(prevState.boughtPrivateMaids);
      const attachments = privateMaids[0] && privateMaids[0].attachments;
      privateMaids[0].attachments = [...(attachments || []), card];
      return { boughtPrivateMaids: privateMaids };
    });
    return;
  }
  inst.setState((prevState) => {
    let newMaids = _.cloneDeep(prevState.chamberMaids);
    const maid = newMaids[maidIdx];
    const attachments = [...(maid.attachments || []), card];
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

function hasSameAttachments(list1, list2) {
  const namelist1 = (list1 || []).map((item) => item.name);
  const namelist2 = (list2 || []).map((item) => item.name);
  return _.isEqual(namelist1, namelist2);
}
