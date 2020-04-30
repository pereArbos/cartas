function Ophelia(chambered, inDeck) {
  if (inDeck <= 1) return 0;
  return inDeck * (inDeck % 2 === 1 ? 2 : -2);
}

function Safran(chambered) {
  const q = Math.floor(chambered / 4);
  const r = chambered % 4;
  let points = q * 12;
  if (r >= 2) points += 4;
  if (r >= 3) points += 4;
  return points;
}

function BadHabit(chambered) {
  return chambered * (chambered >= 4 ? -2 : -1);
}

function Rouge(chamber, inDeck) {
  console.log(chamber + inDeck);
  return chamber + inDeck;
}

function Viola(chamber, inDeck, inst, maids) {
  let points = inDeck + chamber;
  if (maids.AzureCrescent) return points;
  const numRouge = maids.RougeCrescent ? maids.RougeCrescent.chambered : 0;
  console.log(
    points + Math.min(numRouge, chamber) * 3,
    Math.min(numRouge, chamber)
  );
  return points + Math.min(numRouge, chamber) * 3;
}

function Azure(chamber, inDeck, inst, maids) {
  let points = inDeck + chamber;
  const numRouge = maids.RougeCrescent ? maids.RougeCrescent.chambered : 0;
  const numViola = maids.ViolaCrescent ? maids.ViolaCrescent.chambered : 0;
  const allNums = [chamber, numViola, numRouge];
  const minThree = Math.min(...allNums);
  const pairNums = allNums
    .map((num) => num - minThree)
    .filter((num) => num > 0);
  const minTwo = pairNums.length === 2 ? Math.min(...pairNums) : 0;
  console.log(points + minThree * 7 + minTwo * 3, minThree, minTwo);
  return points + minThree * 7 + minTwo * 3;
}

function Colette(chamber, inDeck, inst) {
  const { opponents } = inst.context.parentState;
  const oppColettes = opponents.map((opp) => getColettes(opp, inst));
  const total = chamber + inDeck;
  console.log(total, oppColettes);
  return total + (total > Math.max(...oppColettes) ? 5 : 0);
}

function getColettes(opp, inst) {
  const { discard, chamberMaids } = opp.data;
  const chamberColettes = chamberMaids.find((item) => {
    return item.name === 'ColetteFramboise' && !inst.hasIllness(item);
  });
  let deckColettes = 0;
  discard.forEach((item) => {
    if (item.name === 'ColetteFramboise') deckColettes += 1;
  });
  console.log(chamberColettes);
  console.log(chamberColettes ? chamberColettes.chambered : 0);
  return deckColettes + (chamberColettes ? chamberColettes.chambered : 0);
}

export const vpFuncs = {
  Ophelia,
  Safran,
  BadHabit,
  Rouge,
  Viola,
  Azure,
  Colette,
};
