import React from 'react';
import PropTypes from 'prop-types';

export default function CardBlock(props, context) {
  const { name, set, quantity, selected, type } = props.card;
  const route = set ? `set${set}/${name}` : name;
  return (
    <span className={selected > 0 ? 'card-block selected' : 'card-block'}>
      <div style={{ position: 'relative' }}>
        <img
          alt="noseve"
          src={require(`../cards/${route}.jpg`)}
          className={quantity === 0 ? 'soldOut' : ''}
          style={name === 'cardback' ? { cursor: 'auto' } : {}}
          title={name === 'cardback' && 'Maids Particulares'}
          onMouseOver={() => {
            context.updateImage(route);
          }}
          onMouseOut={() => {
            context.updateImage(null);
          }}
          onClick={() => {
            props.selectCard(props.card);
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
                props.selectCard(props.card, 'minus');
              }}
            >
              -
            </button>
            <span>{selected}</span>
            <button
              type="button"
              disabled={type === 'privateMaid' || quantity === selected}
              style={{
                borderLeft: '1px solid black',
              }}
              onClick={() => {
                props.selectCard(props.card, 'plus');
              }}
            >
              +
            </button>
          </div>
        )}
      </div>

      {type === 'privateMaid' ? (
        <h3 style={{ visibility: 'hidden' }}>1</h3>
      ) : (
        <h3>{quantity}</h3>
      )}
    </span>
  );
}

CardBlock.contextTypes = {
  updateImage: PropTypes.func,
};
