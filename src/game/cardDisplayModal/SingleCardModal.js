import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { defaultStyle } from './defaultStyle';

import './SCModal.css';

export default function SingleCardModal(props, context) {
  const { overlay, content } = defaultStyle;
  const { showSCModal } = context.parentState;
  const { title, message, yesFunc, noFunc, imgRoute } =
    context.parentState.scModalData || {};
  return (
    <ReactModal
      isOpen={showSCModal}
      style={{
        overlay,
        content: { ...content, background: 'rgba(0, 255, 255, 0.75)' },
      }}
      ariaHideApp={false}
    >
      <div className="SCModal">
        <div className="SCtitle ">{title}</div>
        <div className="SCmessage">{message}</div>
        <img
          alt="noseve"
          src={require(`../cards/${imgRoute || '1Love'}.jpg`)}
        />
        <button type="button" style={{ left: '10%' }} onClick={yesFunc}>
          Sí
        </button>
        <button type="button" style={{ left: '80%' }} onClick={noFunc}>
          No
        </button>
      </div>
    </ReactModal>
  );
}

SingleCardModal.contextTypes = {
  parentState: PropTypes.object,
  updateParent: PropTypes.func,
};
