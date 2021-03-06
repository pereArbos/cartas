import React from 'react';
import PropTypes from 'prop-types';
import './OppZones.css';
import './playerZones/PlayerZones.css';

import PlayZone from './playerZones/PlayZone';
import ChamberZone from './playerZones/ChamberZone';
import DeckZone from './playerZones/DeckZone';
import { checkChamberMaids } from '../helpers/actions';

export default class MainPlayer extends React.Component {
  static contextTypes = {
    parentState: PropTypes.object,
    updateParent: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  getIconStructure = () => {
    const { opponents } = this.context.parentState;
    const { oppIdx } = this.props;
    const { discard, hand, deck } = opponents[oppIdx].data;
    return {
      iconData: [
        ['deck.png', deck ? deck.length : 5],
        ['hand.png', hand ? hand.length : 5],
        ['trash.png', discard && discard.length],
      ],
      firstTop: 3.5,
    };
  };

  render() {
    const { oppIdx } = this.props;
    const { gameState, playerClick, opponents } = this.context.parentState;

    const checkMaids =
      checkChamberMaids(opponents[oppIdx].data) ||
      this.context.parentState.freeChambersToo;
    const circleOn = gameState === 'targetPlayer' && playerClick && checkMaids;
    const playerClass = circleOn ? 'selectable' : '';
    const circleClick = circleOn ? playerClick : () => {};

    const { iconData, firstTop } = this.getIconStructure();
    const playedCards = opponents[oppIdx].data.playedCards;
    const oppName = opponents[oppIdx].name;

    return (
      <div style={{ position: 'relative' }}>
        <div className={`OppTable p${oppIdx + 1}`}>
          <DeckZone oppName={oppName} oppIdx={oppIdx} />
          <div style={{ position: 'absolute' }}>
            <PlayZone oppCards={playedCards} oppName={oppName} />
            <ChamberZone oppName={oppName} oppIdx={oppIdx} />
          </div>
        </div>
        <span
          className={`OppCircle p${oppIdx + 1} ${playerClass}`}
          onClick={() => {
            circleClick(oppName);
          }}
        >
          <span className="OppName">{oppName}</span>
        </span>
        {iconData.map((item, idx) => {
          return [
            <div
              className="OppIcons"
              style={{ top: `${firstTop + idx * 8}vh` }}
            >
              <img
                alt="noseve"
                src={require(`./iconFooter/icons/${item[0]}`)}
              />
            </div>,
            <div
              className="OppIcons"
              style={{
                backgroundColor: 'pink',
                top: `${firstTop + 4 + idx * 8}vh`,
              }}
            >
              {item[1]}
            </div>,
          ];
        })}
      </div>
    );
  }
}
