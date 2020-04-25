function Lucienne(context) {
  increaseParam(context, 'servings');
}

function Rosa(context) {
  increaseParam(context, 'love');
}

function Fay(context) {
  context.parentState.setActions({
    message: 'Qué quieres obtener con FayLongfang ?',
    button1Text: '1 Amor',
    button2Text: '1 Contratación',
    button1Click: () => increaseParam(context, 'love'),
    button2Click: () => increaseParam(context, 'contract'),
  });
}

function increaseParam(context, param, noUpdate) {
  context.updatePlayer((prevState) => {
    return { [param]: prevState[param] + 1 };
  });
  if (!noUpdate) context.updateParent({ gameState: 'servingPhase' });
}

function Lalande(context) {
  context.draw(1);
  context.updateParent({ gameState: 'servingPhase' });
}

function Milly(inst, cb) {
  inst.setState({ usadaJoder: 'si' });
  increaseParam(inst.context, 'servings', true);
  cb();
}

function Tanya(inst, cb) {
  console.log('hola?');
  inst.setState((prevState) => {
    console.log('k coño pada');
    return {
      message: 'Robas 1 más con TanyaPetrushka ?',
      button1Text: 'Sí',
      button2Text: 'No',
      button1Click: () => {
        inst.context.draw(1);
        inst.setState({ ...prevState, usadaJoder: 'si' }, cb);
      },
      button2Click: () => inst.setState(prevState, cb),
    };
  });
}

export const functions = { Lucienne, Rosa, Fay, Lalande, Milly, Tanya };
