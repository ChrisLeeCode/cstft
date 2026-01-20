import { useRef, useState } from "react";
import { sendMessage } from "./messageSender";

interface WebsocketConnectProps {
  playerName: string;
  onMessage: (evt: MessageEvent) => void;
}

export const WebsocketConnection = ({
  playerName,
  onMessage,
}: WebsocketConnectProps) => {
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    setStatus("connecting");
    const url = import.meta.env.VITE_WS_URL ?? "ws://localhost:8080/ws";
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      // Send join as first message
      sendMessage(ws, { type: "JOIN", payload: { playerName } });
    };
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");

    ws.onmessage = onMessage;
  };
  //   (evt) => {
  //     const msg: ServerMessage = JSON.parse(evt.data);
  //     switch (msg.type) {
  //       case "joined":
  //         console.log(msg.payload.playerId);
  //         setLog((l) => [`Joined as Player ${msg.payload.playerId}`, ...l]);
  //         break;
  //       case "lobbyData":
  //         setLobbyData(msg.payload.players);
  //         break;
  //       case "gameStage":
  //         setGameStage(msg.payload.stage);
  //         console.log("game stage:", gameStage);
  //         break;
  //       case "error":
  //         setLog((l) => [String(msg.payload?.message ?? "error"), ...l]);
  //         break;
  //     }
  //   };

  return { status, wsRef, connect };
};
