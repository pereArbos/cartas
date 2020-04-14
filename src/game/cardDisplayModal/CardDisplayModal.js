import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import './CardDisplayModal.css';

import { defaultStyle } from './defaultStyle';

export default function CardDisplayModal(props, context) {
  const { showModal, hideModal, background, cards } = props;
  const modalStyle = defaultStyle;
  modalStyle.content.background = background;

  return (
    <ReactModal
      isOpen={showModal}
      style={modalStyle}
      onRequestClose={hideModal}
    >
      <div className="CardDisplayModal">
        <h1>Tu Pila de Descartes</h1>
        <div className="cards">
          {cards.map((card) => {
            const { name, set } = card;
            const route = set ? `set${set}/${name}` : name;
            return (
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
