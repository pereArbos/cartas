import React from 'react';
import './App.css';

import Field from './game/field/Field';
import ImageArea from './game/imageArea/ImageArea';

function App() {
  return (
    <div className="App-base">
      <span style={{ width: '22vw' }} className="mainBlock">
        <div style={{ display: 'block', height: '50vh' }}>hola</div>
        <ImageArea />
      </span>
      <span style={{ width: '56vw' }} className="mainBlock">
        <Field />
      </span>
    </div>
  );
}

export default App;
