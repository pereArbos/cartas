import React from 'react';
import PropTypes from 'prop-types';

export default function CardBlock(props, context) {
  const { name, set, quantity, selected } = props.card;
  const route = set ? `set${set}/${name}` : name;
  return (
    <span className={selected > 0 ? 'card-block selected' : 'card-block'}>
      <div style={{ position: 'relative' }}>
        <img
          alt="noseve"
          src={require(`../cards/${route}.jpg`)}
          className={quantity === 0 ? 'soldOut' : ''}
          style={name === 'cardback' ? { cursor: 'auto' } : {}}
          onMouseOver={() => {
            context.updateParent({
              imageName: route,
            });
          }}
          onMouseOut={() => {
            context.updateParent({
              imageName: null,
            });
          }}
          onClick={() => {
            props.selectCard(name);
          }}
        />

        {selected > 0 && (
          <div className="cardSelector">
            <button
              type="button"
              style={{
                borderRight: '1px solid black',
              }}
              onClick={() => {
                props.selectCard(name, 'minus');
              }}
            >
              -
            </button>
            <span>{selected}</span>
            <button
              type="button"
              disabled={!quantity || quantity === selected}
              style={{
                borderLeft: '1px solid black',
              }}
              onClick={() => {
                props.selectCard(name, 'plus');
              }}
            >
              +
            </button>
          </div>
        )}
      </div>

      {quantity || quantity === 0 ? (
        <h3>{quantity}</h3>
      ) : (
        <h3
          style={{
            color: 'rgba(255, 0, 0, 0)',
          }}
        >
          1
        </h3>
      )}
    </span>
  );
}

CardBlock.contextTypes = {
  updateParent: PropTypes.func,
};
