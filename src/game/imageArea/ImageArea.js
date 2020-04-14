import React from 'react';

export default function ImageArea(props) {
  return (
    <div style={{ display: 'block', width: '100%' }}>
      {props.name && props.name !== 'cardback' && (
        <img
          alt="noseve"
          src={require(`../cards/${props.name}.jpg`)}
          style={{
            maxWidth: '21vw',
            float: 'center',
            display: 'block',
            margin: 'auto',
            userSelect: 'none',
          }}
        />
      )}
    </div>
  );
}
