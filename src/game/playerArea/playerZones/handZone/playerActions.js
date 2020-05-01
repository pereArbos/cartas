import { getTrueData, finishTurn } from '../../../helpers/actions';

export const config = {
  servingPhase: {
    message: 'Fase de Servicios',
    button2Text: 'Fase de Contratación',
    button2Click: (context) => {
      const { hand } = context.playerState;
      const { playerName } = context.parentState;
      const loveCards = hand.filter((card) => card.type === 'love');
      const newDiscards = hand.filter((card) => card.type !== 'love');
      let love = 0;
      let contract = 0;

      context.updatePlayer(
        (prevState) => {
          love = prevState.love;
          contract = prevState.contract;
          const playedCards = [...prevState.playedCards];
          playedCards.push(...loveCards);
          loveCards.forEach((card) => (love += card.love));
          return { love, servings: 0, hand: [], playedCards };
        },
        () => {
          context.updateParent((prevState) => {
            const discard = [...prevState.discard];
            discard.push(...newDiscards);
            return {
              gameState: 'contractPhase',
              discard,
              money: { love, contract },
            };
          });
          context.updateMessage(
            `${playerName} termina su fase de Servicios con ${love} &love& y ${contract} &contract&`
          );
        }
      );
    },
  },
  contractPhase: { message: 'Fase de Contratación' },
  discardPhase: {
    button2Text: 'Fin de Turno',
    button2Click: (context) => {
      const endTurn = () => {
        context.draw(5, () => finishTurn(context));
      };
      const discardAction = getDiscardAction(context);
      if (discardAction) {
        discardAction(context, endTurn);
      } else endTurn();
    },
  },
  opponentTurn: { message: '', button2Text: null },
  gameEnded: { message: '', button2Text: null },
  startPhase: {
    message: 'Fase de Inicio',
    button2Text: 'Fase de Servicios',
    button2Click: (context) => {
      context.updateParent({ gameState: 'servingPhase' });
    },
  },
};

function getDiscardAction(context) {
  const { opponents } = context.parentState;
  const bullyOpp = opponents.find((opp) => {
    const oppMaid = getTrueData(opp.data.boughtPrivateMaids[0]);
    if (!oppMaid || !oppMaid.onOppDiscard) return false;
    return !hasIllness(oppMaid);
  });
  return (
    bullyOpp && getTrueData(bullyOpp.data.boughtPrivateMaids[0]).onOppDiscard
  );
}

function hasIllness(card) {
  if (!card.attachments) return false;
  return card.attachments.find((item) => item.name === 'Illness');
}
