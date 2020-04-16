import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import './CardDisplayModal.css';

import { defaultStyle, privateMaidsStyle } from './defaultStyle';

export default function CardDisplayModal(props, context) {
  const {
    showModal,
    hideModal,
    background,
    cards,
    title,
    mode,
    extraCmp,
  } = props;
  const { overlay, content } =
    mode === 'privateMaids' ? privateMaidsStyle : defaultStyle;
  let extraClass = mode === 'privateMaids' ? 'privateModal chamberModal' : '';
  if (mode === 'chamber') extraClass = 'chamberModal';

  return (
    <ReactModal
      isOpen={showModal}
      style={{ overlay, content: { ...content, background } }}
      onRequestClose={hideModal}
    >
      <div className={`CardDisplayModal ${extraClass}`}>
        <h1>{title}</h1>
        <div className="cards">
          {typeof extraCmp === 'function' && extraCmp()}
          {cards.map((card) => {
            const { name, set, chambered } = card;
            const route = set ? `set${set}/${name}` : name;
            return (
              <div className="cardBlock">
                <img
                  alt="noseve"
                  src={require(`../cards/${route}.jpg`)}
                  onMouseOver={() => {
                    context.updateImage(route);
                  }}
                  onMouseOut={() => {
                    context.updateImage(null);
                  }}
                />
                {mode === 'chamber' && <h3>{chambered}</h3>}
              </div>
            );
          })}
        </div>
        <button type="button" onClick={hideModal}>
          OK
        </button>
      </div>
    </ReactModal>
  );
}

CardDisplayModal.contextTypes = {
  updateImage: PropTypes.func,
};
