import { useReducer } from "react";
import { GameStageMessageType, LobbyDataMessageType, type PlayerData } from "../../../types/generated";
import type { ServerMessage } from "../../../types/serverMessages";

interface GameState {
  lobbyData: PlayerData[];
  gameStage: string
}

interface GameAction {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
}

const initialGameState: GameState = {
  lobbyData: [],
  gameStage: 'lobby'
};

function reducer(state: GameState, action: GameAction) {
  switch (action.type) {
    case LobbyDataMessageType: {
      return {
        ...state,
        lobbyData: action.payload,
      };
    }
    case GameStageMessageType: {
        return {
            ...state,
            gameStage: action.payload
        }
    }
  }

  throw Error("Unknown action");
}

export const useGameState = () => {

  const [state, dispatch] = useReducer(reducer, initialGameState);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMessage = (evt: MessageEvent<any>) => {
    const msg: ServerMessage = JSON.parse(evt.data);
    dispatch({type: msg.type, payload: msg.payload})
    // switch (msg.type) {
    //   case "joined":
    //     console.log("joined", msg.payload.playerId);
    //     break;
    //   case LobbyDataMessage:
    //     setLobbyData(msg.payload.players);
    //     break;
    //   case "gameStage":
    //     setGameStage(msg.payload.stage);
    //     console.log("game stage:", gameStage);
    //     break;
    //   case "error":
    //     break;
    // }
  };

  return { onMessage, state };
};
