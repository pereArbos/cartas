import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { defaultStyle } from './defaultStyle';

import './ResultsModal.css';

export default function SingleCardModal(props, context) {
  const { overlay, content } = defaultStyle;
  const { showResultsModal, results } = context.parentState;
  const colors = ['#ffcc00', 'gray', 'brown', 'white'];

  return (
    <ReactModal
      isOpen={showResultsModal}
      style={{
        overlay,
        content: {
          ...content,
          background: 'rgba(0, 0, 255, 0.9)',
          left: '31%',
          width: '36vw',
        },
      }}
      onRequestClose={() => context.updateParent({ showResultsModal: false })}
      ariaHideApp={false}
    >
      <div className="ResultsModal">
        <div className="ResTitle ">Resultados</div>
        {results.map((item, idx) => {
          return (
            <div className="playerRes">
              <div
                style={{ width: '20%', color: colors[idx], fontSize: '40px' }}
              >
                {idx + 1}
              </div>
              <div style={{ width: '20%' }}>{item.name}</div>
              <div style={{ width: '60%', color: 'pink' }}>{item.vp} VP</div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => context.updateParent({ showResultsModal: false })}
        >
          OK
        </button>
      </div>
    </ReactModal>
  );
}

SingleCardModal.contextTypes = {
  parentState: PropTypes.object,
  updateParent: PropTypes.func,
};
