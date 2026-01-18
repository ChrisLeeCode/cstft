import { useReducer, useState } from "react";
import type { PlayerData } from "../types/types";
import type { ServerMessage } from "../types/serverMessages";

interface GameState {
    foo: string
    zoo: string
}

interface GameAction {
    type: string
}

const initialGameState: GameState = {
    foo: 'bar',
    zoo: 'lar'

}

function reducer(state: GameState, action: GameAction) {
    switch (action.type) {
        case 'test': {
            return {
                ...state,
                foo: 'modified'
            }
        }
    }
  
  throw Error('Unknown action');
}

export const useGameState = (() => {

      const [lobbyData, setLobbyData] = useState<PlayerData[]>([]);
      const [gameStage, setGameStage] = useState("lobby")
    

     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     const onMessage = (evt: MessageEvent<any>) => {
        const msg: ServerMessage = JSON.parse(evt.data);
        switch (msg.type) {
          case "joined":
            console.log("joined", msg.payload.playerId);
            break;
          case "lobbyData":
            setLobbyData(msg.payload.players);
            break;
          case "gameStage":
            setGameStage(msg.payload.stage);
            console.log("game stage:", gameStage);
            break;
          case "error":
            break;
        }
      };

      const [state, dispatch] = useReducer(reducer, initialGameState);


      
    return {lobbyData, onMessage, gameStage}
})