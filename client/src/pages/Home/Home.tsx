import { useState } from "react";
import Game from "./components/Game/Map";
import { WebsocketConnection } from "./websocket/websocket";
import { useGameState } from "./hooks/gameState";
import { ReadyStatusMessage } from "../../types/generated";

const Home = () => {

  const [readyStatus, setReadyStatus] = useState(false);

  const [playerName, setPlayerName] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const onMessage = (evt: MessageEvent<any>) => {
  //   const msg: ServerMessage = JSON.parse(evt.data);
  //   switch (msg.type) {
  //     case "joined":
  //       console.log(msg.payload.playerId);
  //       setLog((l) => [`Joined as Player ${msg.payload.playerId}`, ...l]);
  //       break;
  //     case "lobbyData":
  //       setLobbyData(msg.payload.players);
  //       break;
  //     case "gameStage":
  //       setGameStage(msg.payload.stage);
  //       console.log("game stage:", gameStage);
  //       break;
  //     case "error":
  //       setLog((l) => [String(msg.payload?.message ?? "error"), ...l]);
  //       break;
  //   }
  // };

  const {state: {lobbyData, gameStage}, onMessage} = useGameState()

  const { status, wsRef, connect } = WebsocketConnection({
    playerName,
    onMessage,
  });

  const toggleReadyStatus = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const newReadyState = !readyStatus;
    ws.send(
      JSON.stringify({
        type: ReadyStatusMessage,
        payload: { status: newReadyState },
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
