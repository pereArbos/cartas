import React from 'react';
import './App.css';

import ConnexionGame from './game/ConnexionGame';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { playerName: '' };
  }

  getGameMenu = () => {
    return (
      <div className="App-base mainBlock">
        <div className="menuButton">
          <button
            type="button"
            style={{ top: '20vh' }}
            onClick={() => {
              this.setState({ mainPlayer: true });
            }}
          >
            Crear Partida
          </button>
          <button
            type="button"
            style={{ top: '60vh' }}
            onClick={() => {
              this.setState({ mainPlayer: false });
            }}
          >
            Unirse
          </button>
        </div>
      </div>
    );
  };

  getNameMenu = () => {
    return (
      <div className="App-base mainBlock">
        <div className="nameMenu">
          <div className="title">Escribe Tu Nombre</div>
          <input
            type="text"
            value={this.state.playerName}
            onChange={(e) => {
              this.setState({ playerName: e.target.value });
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (this.state.playerName.length > 0)
                this.setState({ start: true });
            }}
          >
            Listos
          </button>
        </div>
      </div>
    );
  };

  render() {
    const { playerName, mainPlayer, start } = this.state;
    if (typeof mainPlayer === typeof undefined) return this.getGameMenu();
    if (!start) return this.getNameMenu();
    return <ConnexionGame playerName={playerName} mainPlayer={mainPlayer} />;
  }
}
