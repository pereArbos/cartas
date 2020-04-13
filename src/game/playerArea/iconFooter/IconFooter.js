import React from 'react';

export default class DeckZone extends React.Component {
  getIconValue = (image, value, left) => {
    return [
      <div className="IconFooter" style={{ left: `${left}vw` }}>
        <img alt="noseve" src={require(`./icons/${image}`)} />
      </div>,
      <div
        className="IconFooter"
        style={{ backgroundColor: '#ffadd7', left: `${left + 3}vw` }}
      >
        {value || 0}
      </div>,
    ];
  };

  render() {
    const { data, firstLeft } = this.props;
    return data.map((item, idx) => {
      return this.getIconValue(item[0], item[1], firstLeft + idx * 6);
    });
  }
}
