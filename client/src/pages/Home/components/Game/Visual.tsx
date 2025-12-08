import { cellHeight, cellWidth, gridWidth, gridHeight } from "../constants";

const Cell = () => {
  return (
    <div
      className="border"
      style={{ height: cellHeight, width: cellWidth }}
    ></div>
  );
};

const Row = () => {
  const getRow = () => {
    const row = [];
    {
      for (let i = 0; i < gridWidth; i++) {
        row.push(<Cell />);
      }
    }
    return row;
  };
  return <div className="flex">{getRow()}</div>;
};

const Grid = () => {
  const getGrid = () => {
    const grid = [];
    for (let i = 0; i < gridHeight; i++) {
      grid.push(<Row />);
    }
    return grid;
  };
  return <div>{getGrid()}</div>;
};


const Visual = () => {
  return <Grid />
};

export default Visual;