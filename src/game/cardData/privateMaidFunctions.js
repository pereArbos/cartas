function Lucienne(context) {
  increaseParam(context, 'servings', 'Lucienne');
}

function Rosa(context) {
  increaseParam(context, 'love', 'Rosa');
}

function Fay(context) {
  context.parentState.setActions({
    message: 'Qué quieres obtener con FayLongfang ?',
    button1Text: '1 Amor',
    button2Text: '1 Contratación',
    button1Click: () => increaseParam(context, 'love', 'Fay'),
    button2Click: () => increaseParam(context, 'contract', 'Fay'),
  });
}

function increaseParam(context, param, name, noUpdate) {
  context.updatePlayer((prevState) => {
    return { [param]: prevState[param] + 1 };
  });
  if (!noUpdate) context.updateParent({ gameState: 'servingPhase' });
  const { playerName } = context.parentState;
  context.updateMessage(
    `${
      noUpdate ? 'Al robar una carta' : 'En su fase de Inicio'
    }, ${playerName} gana 1 &${param}& con la habilidad de ${name}.`
  );
}

function Lalande(context) {
  const { playerName } = context.parentState;
  context.draw(1);
  context.updateParent({ gameState: 'servingPhase' });
  context.updateMessage(
    `En su fase de Inicio, ${playerName} roba 1 carta con la habilidad de Lalande.`
  );
}

function Milly(inst, cb) {
  inst.setState({ usadaJoder: 'si' });
  increaseParam(inst.context, 'servings', 'Milly', true);
  cb();
}

function Tanya(inst, cb) {
  inst.setState((prevState) => {
    return {
      message: 'Robas 1 más con TanyaPetrushka ?',
      button1Text: 'Sí',
      button2Text: 'No',
      button1Click: () => {
        inst.context.draw(1);
        inst.setState({ ...prevState, usadaJoder: 'si' }, cb);
        const { updateMessage, parentState } = inst.context;
        updateMessage(
          `Al robar una carta, ${parentState.playerName} roba otra carta con la habilidad de Tanya.`
        );
      },
      button2Click: () => inst.setState(prevState, cb),
    };
  });
}

export const functions = { Lucienne, Rosa, Fay, Lalande, Milly, Tanya };
