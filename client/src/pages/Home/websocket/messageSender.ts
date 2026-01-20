import type { ClientMessage } from "../../../types";

/**
 * Send a type-safe client message via WebSocket
 *
 * TypeScript will validate that the message structure matches the ClientMessage union type.
 * When you specify the `type` field, TypeScript narrows the expected `payload` structure.
 *
 * @example
 * sendMessage(ws, { type: "JOIN", payload: { playerName: "Alice" } });
 * sendMessage(ws, { type: "READY_STATUS", payload: { status: true } });
 */
export const sendMessage = <T extends ClientMessage>(
  ws: WebSocket,
  message: T
): void => {
  ws.send(JSON.stringify(message));
};
