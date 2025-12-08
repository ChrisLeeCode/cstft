import type { PlayerData } from "./types";

type BaseServerMessage = {
  timestamp: number;
};

interface JoinedMessage extends BaseServerMessage {
  type: "joined";
  payload: {
    playerId: number;
  };
}

interface LobbyDataMessage extends BaseServerMessage {
  type: "lobbyData";
  payload: {
    players: PlayerData[]
  };
}

interface GameStageMessage extends BaseServerMessage {
  type: "gameStage";
  payload: {
    stage: string
  };
}

interface ErrorMessage extends BaseServerMessage {
  type: "error";
  payload: {
    message: string;
  };
}

export type ServerMessage = JoinedMessage | ErrorMessage | LobbyDataMessage | GameStageMessage;
