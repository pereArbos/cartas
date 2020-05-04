import { functions } from './privateMaidFunctions';

export const privateMaids = [
  {
    name: 'AmberTwilight',
    set: 1,
    type: 'privateMaid',
    cost: 5,
    vp: -3,
    onOppDiscard: functions.Amber,
  },
  {
    name: 'NordTwilight',
    set: 1,
    type: 'privateMaid',
    cost: 4,
    vp: -4,
    onStart: functions.Nord,
  },
  {
    name: 'SoraNakachi',
    set: 1,
    type: 'privateMaid',
    cost: 7,
    vp: 2,
    onStart: functions.Sora,
  },
  {
    name: 'FayLongfang',
    set: 1,
    type: 'privateMaid',
    cost: 6,
    vp: 0,
    auto: true,
    onStart: functions.Fay,
  },
  {
    name: 'LalandeDreyfus',
    set: 1,
    type: 'privateMaid',
    cost: 6,
    vp: 2,
    onStart: functions.Lalande,
  },
  {
    name: 'MillyViolet',
    set: 1,
    type: 'privateMaid',
    cost: 5,
    vp: 2,
    onDraw: functions.Milly,
  },
  {
    name: 'EugenieFontaine',
    set: 1,
    type: 'privateMaid',
    cost: 5,
    vp: 0,
    onStart: functions.Eugenie,
    forcedAction: functions.actionEugenie,
  },
  {
    name: 'LucienneDeMarlboro',
    set: 1,
    type: 'privateMaid',
    cost: 5,
    vp: 1,
    auto: true,
    onStart: functions.Lucienne,
  },
  {
    name: 'RosaTopaz',
    set: 1,
    type: 'privateMaid',
    cost: 5,
    vp: 1,
    auto: true,
    onStart: functions.Rosa,
  },
  {
    name: 'TanyaPetrushka',
    set: 1,
    type: 'privateMaid',
    cost: 4,
    vp: 1,
    onDraw: functions.Tanya,
  },
];