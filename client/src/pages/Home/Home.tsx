import { useState } from "react";
import Game from "./components/Game/Map";
import { useGame } from "../../context/GameContext";

const Home = () => {
  const [readyStatus, setReadyStatus] = useState(false);
  const [playerName, setPlayerName] = useState("");

  const { state, status, connect, sendMessage } = useGame();

  console.log("state in Home.tsx", state);

  const toggleReadyStatus = () => {
    const newReadyState = !readyStatus;
    sendMessage({ type: "READY_STATUS", payload: { status: newReadyState } });
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
            <button onClick={() => connect(playerName)} className="border p-1 rounded">
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
          {state.lobbyData.length > 0 ? (
            <div className="flex flex-col">
              {state.lobbyData.map((data) => (
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
      {state.gameStage === "gameStarted" && <Game />}
    </div>
  );
};

export default Home;
