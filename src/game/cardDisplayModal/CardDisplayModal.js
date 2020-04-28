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
    oppName,
  } = props;

  const { overlay, content } =
    mode === 'privateMaids' ? privateMaidsStyle : defaultStyle;

  let extraClass = mode === 'privateMaids' ? 'privateModal chamberModal' : '';
  if (mode === 'chamber') extraClass = 'chamberModal';

  const maxAttach = getMaxAttachment(cards);

  return (
    <ReactModal
      isOpen={showModal}
      style={{ overlay, content: { ...content, background } }}
      onRequestClose={hideModal}
      ariaHideApp={false}
    >
      <div className={`CardDisplayModal ${extraClass}`}>
        <h1>{title}</h1>
        <div className="cards">
          {typeof extraCmp === 'function' && extraCmp()}
          {cards.map((card, idx) =>
            renderCard(card, idx, context, mode, maxAttach, oppName)
          )}
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
  parentState: PropTypes.object,
};

function getImage(route, context, style, selectInfo) {
  const { imageClass, onClick } = selectInfo;

  return (
    <img
      alt="noseve"
      src={require(`../cards/${route}.jpg`)}
      className={imageClass}
      onMouseOver={() => {
        context.updateImage(route);
      }}
      onMouseOut={() => {
        context.updateImage(null);
      }}
      onClick={onClick}
      style={style || {}}
    />
  );
}

function renderCard(card, cardIdx, context, mode, maxAttach, oppName) {
  const { chambered, attachments } = card;
  const AttachmentsDisplay = (attachments || []).map((item, idx) => {
    return getImage(
      getRoute(item),
      context,
      { position: 'absolute', top: `${1.5 * (idx + 1)}vw`, left: 0 },
      getSelectInfo(mode, card, cardIdx, context, oppName, item)
    );
  });
  const info = getSelectInfo(mode, card, cardIdx, context, oppName);

  return (
    <div className="cardBlock">
      <div style={{ position: 'relative' }}>
        {getImage(getRoute(card), context, {}, info)}
        {AttachmentsDisplay}
      </div>
      {mode === 'chamber' && (
        <h3 style={{ marginTop: `calc(${maxAttach * 1.5}vw - 8px)` }}>
          {chambered}
        </h3>
      )}
    </div>
  );
}

function getRoute(card) {
  const { name, set } = card;
  return set ? `set${set}/${name}` : name;
}

function getMaxAttachment(cards) {
  const attachNums = cards.map((item) =>
    item.attachments ? item.attachments.length : 0
  );
  return Math.max(...attachNums);
}

function getSelectInfo(mode, card, cardIdx, context, oppName, attach) {
  const { gameState, maidClick, eventClick } = context.parentState;
  const { type } = card;

  if (gameState === 'targetEvent' && eventClick) {
    if (type === 'event' || attach) {
      return {
        imageClass: 'selectable',
        onClick: () =>
          eventClick(attach || card, cardIdx, type === 'privateMaid', oppName),
      };
    }
  }
  const selecting = maidClick && gameState === 'targetChamberMaid';
  const chamberCard = mode === 'chamber' && type.includes('maid');
  const privateMaid = type === 'privateMaid' && cardIdx === 0;
  const clickable = selecting && (chamberCard || privateMaid);

  const imageClass = clickable ? 'selectable' : '';
  const imageClick = () => {
    maidClick(cardIdx, type === 'privateMaid', oppName);
  };
  const onClick = clickable ? imageClick : () => {};
  return { imageClass, onClick };
}
