import { useMemo} from "react";
import Character from "../Character/Character";
import Visual from "./Visual";
import { useGame } from "../../../../context/GameContext";

const Game = () => {
  const { sendMessage, state } = useGame();

  const characters = useMemo(() => {
    return state.lobbyData.flatMap((playerData) => playerData.characters.map((char) => ({...char, isFriendly: playerData.id === state.playerId})))
  }, [state.lobbyData])

  const handleAddCharacterClick = () => {
    sendMessage({ type: 'ADD_CHARACTER', payload: { character: { pos: { x: 0, y: 0 }, rotation: 45 } } })
  }
  return (
    <div>
      {characters.map((data) => <Character {...data} />)}
      <Visual />
      <button onClick={handleAddCharacterClick} className="border rounded p-1 m-2">
        Add character
      </button>
    </div>
  );
};

export default Game;
