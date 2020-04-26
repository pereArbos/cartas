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
      context.draw(5);
      context.updateParent({ gameState: 'startPhase' }); // Pasar turno
    },
  },
  startPhase: {
    message: 'Fase de Inicio',
    button2Text: 'Fase de Servicios',
    button2Click: (context) => {
      context.updateParent({ gameState: 'servingPhase' });
    },
  },
};
