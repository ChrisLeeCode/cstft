import type {
  ErrorMessage,
  GameStageMessage,
  JoinedMessage,
  LobbyDataMessage,
} from "./generated";

export type ServerMessage =
  | JoinedMessage
  | ErrorMessage
  | LobbyDataMessage
  | GameStageMessage;
