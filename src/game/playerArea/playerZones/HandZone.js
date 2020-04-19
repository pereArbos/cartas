import React from 'react';
import PropTypes from 'prop-types';

export default class HandZone extends React.Component {
  static contextTypes = {
    playerState: PropTypes.object,
    updateImage: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { hand } = this.context.playerState;
    return (
      <div className="HandZone">
        <h6>Hola soy un Mensaje</h6>
        <div className="handCards">
          {hand.map((card, idx, list) => {
            const { name, set } = card;
            const route = set ? `set${set}/${name}` : name;
            return (
              <img
                alt="noseve"
                src={require(`../../cards/${route}.jpg`)}
                onMouseOver={() => {
                  this.context.updateImage(route);
                }}
                onMouseOut={() => {
                  this.context.updateImage(null);
                }}
                style={{
                  left: `${8.8 + 1.4 * idx - 0.7 * list.length}vw`,
                  zIndex: list.length - idx,
                }}
              />
            );
          })}
        </div>
        <button type="button" style={{ left: '5px' }}>
          Boton 1
        </button>
        <button type="button" style={{ right: '5px' }}>
          Boton 2
        </button>
      </div>
    );
  }
}
