import React from 'react';
import './MainPlayer.css';

import PlayZone from './playerZones/PlayZone';
import HandZone from './playerZones/HandZone';
import ChamberZone from './playerZones/ChamberZone';
import DeckZone from './playerZones/DeckZone';
import './playerZones/PlayerZones.css';

export default class MainPlayer extends React.Component {
  render() {
    return (
      <div className="PlayerArea">
        <div className="PlayerTable">
          <PlayZone />
          <HandZone />
          <ChamberZone />
          <DeckZone />
        </div>
        <span className="PlayerCircle">
          <span className="PlayerName">PERE</span>
        </span>
        buenas
      </div>
    );
  }
}
