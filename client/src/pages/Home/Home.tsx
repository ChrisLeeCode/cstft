import React, { useRef, useState } from "react";
import type { ServerMessage } from "./types/serverMessages";
import Game from "./components/Game/Map";
import type { PlayerData } from "./types/types";

const Home = () => {
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");

  const [readyStatus, setReadyStatus] = useState(false);

  const [lobbyData, setLobbyData] = useState<PlayerData[]>([]);
  const [gameStage, setGameStage] = useState("lobby")

  const [log, setLog] = useState<string[]>([]);
  const [playerName, setPlayerName] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    setStatus("connecting");
    const url = import.meta.env.VITE_WS_URL ?? "ws://localhost:8080/ws";
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      // Send join as first message
      const join = { type: "join", payload: { playerName } };
      ws.send(JSON.stringify(join));
    };
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");

    ws.onmessage = (evt) => {
      const msg: ServerMessage = JSON.parse(evt.data);
      switch (msg.type) {
        case "joined":
          console.log(msg.payload.playerId);
          setLog((l) => [`Joined as Player ${msg.payload.playerId}`, ...l]);
          break;
        case "lobbyData":
          setLobbyData(msg.payload.players);
          break;
        case "gameStage":
          setGameStage(msg.payload.stage)
          console.log("game stage:", gameStage)
          break;
        case "error":
          setLog((l) => [String(msg.payload?.message ?? "error"), ...l]);
          break;
      }
    };
  };

  const toggleReadyStatus = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const newReadyState = !readyStatus;
    ws.send(
      JSON.stringify({
        type: "readyStatus",
        payload: { readyStatus: newReadyState },
        timestamp: Date.now(),
      })
    );
    setReadyStatus(newReadyState);
  };

  return (
    <div>
      <div className="flex justify-evenly p-1">
        <div>Status: {status}</div>
        {status === "disconnected" ? (
          <div>
            <input
              placeholder="Name..."
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
              }}
              className="border mr-2 p-1 rounded"
            />
            <button onClick={connect} className="border p-1 rounded">
              Connect
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            Ready{" "}
            <input
              checked={readyStatus}
              onClick={toggleReadyStatus}
              type="checkbox"
              className="p-2 cursor-pointer ml-2"
            />
          </div>
        )}
        <div className="bold">
          Log:
          <div className="flex flex-col">
            {log.length === 0
              ? "none"
              : log.map((log) => {
                  return <div>{log}</div>;
                })}
          </div>
        </div>
        <div>
          Lobby
          {lobbyData.length > 0 ? (
            <div className="flex flex-col">
              {lobbyData.map((data) => (
                <div className="flex items-center">
                  <input
                    checked={data.isReady}
                    readOnly
                    height={18}
                    width={18}
                    type="checkbox"
                    className="p-7 cursor-pointer mr-2"
                  />
                  <div>{data.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div>empty</div>
          )}
        </div>
      </div>
      {gameStage === "gameStarted" && <Game />}
    </div>
  );
};

export default Home;
