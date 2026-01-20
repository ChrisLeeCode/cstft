// IMPORTANT: When adding a new client message type to models.go,
// remember to add it to this union
import type {
  JoinMessage,
  ReadyStatusMessage,
  AddCharacterMessage,
  ChooseMessage,
  PingMessage,
} from "./generated";

export type ClientMessage =
  | JoinMessage
  | ReadyStatusMessage
  | AddCharacterMessage
  | ChooseMessage
  | PingMessage;
