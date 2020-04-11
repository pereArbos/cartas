import React from 'react';

export default function ImageArea() {
  return (
    <div style={{ display: 'block', width: '100%' }}>
      <img
        alt="noseve"
        src={require(`../cards/1Love.jpg`)}
        style={{
          maxHeight: '49vh',
          float: 'center',
          display: 'block',
          margin: 'auto',
        }}
      />
    </div>
  );
}
