// IMPORTANT: When adding a new server message type to models.go,
// remember to add it to this union
import type {
  ErrorMessage,
  GameStageMessage,
  JoinedMessage,
  LobbyDataMessage,
  PongMessage,
} from "./generated";

export type ServerMessage =
  | JoinedMessage
  | LobbyDataMessage
  | GameStageMessage
  | ErrorMessage
  | PongMessage;
