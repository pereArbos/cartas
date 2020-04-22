import React from 'react';
import PropTypes from 'prop-types';
import './OppZones.css';
import './playerZones/PlayerZones.css';

import PlayZone from './playerZones/PlayZone';
import ChamberZone from './playerZones/ChamberZone';
import DeckZone from './playerZones/DeckZone';

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
    const { deck, discard } = this.context.parentState;
    const hand = []; // resibir de los peers y guardarlo en oppStates
    return {
      iconData: [
        ['deck.png', deck && deck.length],
        ['hand.png', hand && hand.length],
        ['trash.png', discard && discard.length],
      ],
      firstTop: 3.5,
    };
  };

  render() {
    const { oppIdx } = this.props;
    const { gameState, playerClick } = this.context.parentState;
    const circleOn = gameState === 'targetPlayer' && playerClick;
    const playerClass = circleOn ? 'selectable' : '';
    const circleClick = circleOn ? playerClick : () => {};

    const { iconData, firstTop } = this.getIconStructure();

    return (
      <div style={{ position: 'relative' }}>
        <div className={`OppTable ${oppIdx}`}>
          <DeckZone opp={oppIdx} />
          <div style={{ position: 'absolute' }}>
            <PlayZone opp={oppIdx} />
            <ChamberZone opp={oppIdx} />
          </div>
        </div>
        <span
          className={`OppCircle ${oppIdx} ${playerClass}`}
          onClick={circleClick}
        >
          <span className="OppName">CARLOS</span>
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
