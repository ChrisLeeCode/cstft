import { cellHeight, cellWidth } from "../constants";
type Pos = {
  x: number;
  y: number;
};

export interface CharacterProps {
  pos: Pos;
  rotation?: number
}

const Character = ({ pos, rotation = 0 }: CharacterProps) => {
  return (
    <div
      className="absolute border border-red-500"
      style={{
        height: cellHeight,
        width: cellWidth,
        marginLeft: cellWidth * pos.x,
        marginTop: cellHeight * pos.y,
      }}
    >
      <div
        className="border w-full h-full flex items-center justify-center"
        style={{ rotate: `${rotation}deg` }}
      >
        {`->`}
      </div>
    </div>
  );
};

export default Character;
