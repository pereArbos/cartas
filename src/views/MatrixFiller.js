import React from "react";
import Select2 from "react-select2-wrapper";

const numPlayers = 4;
const initValues = [
  [3, 3, 3, 3],
  [3, 3, 3, 3],
  [3, 3, 3, 3],
  [3, 3, 3, 3],
];
const topValue = 5;
const factions = [
  "Adepta Sororitas",
  "Adeptus Custodes",
  "Adeptus Mechanicus",
  "Aeldari",
  "Astra Militarum",
  "Black Templars",
  "Blood Angels",
  "Chaos Daemons",
  "Chaos Knights",
  "Chaos Space Marines",
  "Craftworlds",
  "Dark Angels",
  "Death Guard",
  "Deathwatch",
  "Drukhari",
  "Genestealer Cults",
  "Grey Knights",
  "Hatlequins",
  "Imperial Knights",
  "Necrons",
  "Orks",
  "Tau Empire",
  "Thousand Sons",
  "Tyranids",
  "Space Marines",
  "Space Wolves",
];

export default class MatrixFiller extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matrix: initValues,
      team: ["Adeptus Custodes", "Chaos Daemons", "Craftworlds", "Tau Empire"],
      rivals: ["", "", "", ""],
    };
  }

  getSelector = (i, j) => {
    if (!i && !j) return <div className="matrixCell"></div>;
    const teamKey = !j ? "team" : "rivals";
    return (
      <div className="matrixCell">
        <Select2
          name={teamKey}
          value={this.state[teamKey][(i || j) - 1]}
          data={factions}
          onChange={(e) => {
            this.handleChange(e, (i || j) - 1);
          }}
        />
      </div>
    );
  };

  handleChange = (e, i) => {
    const { name, value } = e.target;
    this.setState((prevState) => {
      const newList = [...prevState[name]];
      newList[i] = value;
      return { [name]: newList };
    });
  };

  changeNum = (sign, i, j) => {
    this.setState((prevState) => {
      const newValues = [...prevState.matrix];
      const newRow = [...newValues[i]];
      const cellValue = sign === "+" ? newRow[j] + 1 : newRow[j] - 1;
      newRow[j] = Math.max(Math.min(cellValue, topValue), 1);
      newValues[i] = newRow;
      return { matrix: newValues };
    });
  };

  render() {
    const { matrix } = this.state;
    return (
      <div className="matrix">
        {[...Array(numPlayers + 1).keys()].map((i) => {
          return (
            <div className="matrixRow">
              {[...Array(numPlayers + 1).keys()].map((j) => {
                if (i === 0 || j === 0) return this.getSelector(i, j);
                return (
                  <div className="matrixCell">
                    <div className="cellNum">
                      <div>{matrix[i - 1][j - 1]}</div>
                    </div>
                    <div className="cellButtons">
                      <button
                        type="button"
                        style={{ backgroundColor: "#77ff00" }}
                        onClick={() => {
                          this.changeNum("+", i - 1, j - 1);
                        }}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        style={{ backgroundColor: "red" }}
                        onClick={() => {
                          this.changeNum("-", i - 1, j - 1);
                        }}
                      >
                        -
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        <button
          type="button"
          className="btnNext"
          disabled={this.state.rivals.filter((item) => item && item.length).length < 4}
          onClick={() => {
            this.props.next({ ...this.state });
          }}
        >
          Next
        </button>
      </div>
    );
  }
}
