import { useReducer } from "react";
import type { Player } from "../../../types/generated";
import type { ServerMessage } from "../../../types/serverMessages";

interface GameState {
  playerId: number | null;
  lobbyData: Player[];
  gameStage: string;
}

const initialGameState: GameState = {
  playerId: null,
  lobbyData: [],
  gameStage: "lobby",
};

// Handles incoming messages from the server
function reducer(state: GameState, message: ServerMessage): GameState {
  switch (message.type) {
    case "JOINED":
      return {
        ...state,
        playerId: message.payload.playerId,
      };

    case "LOBBY_DATA":
      return {
        ...state,
        lobbyData: message.payload.players,
      };

    case "GAME_STAGE":
      return {
        ...state,
        gameStage: message.payload.stage,
      };

    case "ERROR":
      // Handle errors (could log, show toast, etc.)
      console.error("Server error:", message.payload.message);
      return state;

    case "PONG":
      // Handle pong if needed
      return state;

    default:
      // TypeScript ensures this is exhaustive
      const _exhaustive: never = message;
      console.warn("Unhandled message type:", _exhaustive);
      return state;
  }
}

export const useGameState = () => {
  const [state, dispatch] = useReducer(reducer, initialGameState);

  const onMessage = (evt: MessageEvent) => {
    const msg: ServerMessage = JSON.parse(evt.data);
    dispatch(msg);
  };

  return { onMessage, state };
};
