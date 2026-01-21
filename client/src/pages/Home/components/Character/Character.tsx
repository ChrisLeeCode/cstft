import { cellHeight, cellWidth } from "../constants";
type Pos = {
  x: number;
  y: number;
};

export interface CharacterProps {
  pos: Pos;
  isFriendly: boolean
  rotation?: number
  
}

const Character = ({ pos, isFriendly, rotation = 0 }: CharacterProps) => {
  return (
    <div
      className="absolute border"
      style={{
        height: cellHeight,
        width: cellWidth,
        marginLeft: cellWidth * pos.x,
        marginTop: cellHeight * pos.y,
        borderColor: isFriendly ? 'green' : 'red' 
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ rotate: `${rotation}deg`}}
      >
        {`->`}
      </div>
    </div>
  );
};

export default Character;
