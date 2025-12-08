import { useState } from "react";
import Character, { type CharacterProps } from "../Character/Character";
import Visual from "./Visual";

const Game = () => {

  const [characters, setCharacters] = useState<CharacterProps[]>([])

  const handleAddCharacterClick = () => {
    setCharacters((prev) => [...prev, {pos: {x: prev.length, y: prev.length}}])
  }
  return (
    <div>
      {characters.map((data) => <Character {...data}/>)}
      <Visual/>
      <button onClick={handleAddCharacterClick} className="border rounded p-1 m-2">
        Add character
      </button>
    </div>
  );
};

export default Game;
