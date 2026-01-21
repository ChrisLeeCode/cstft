import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Player } from "../types/generated";
import type { ServerMessage } from "../types/serverMessages";
import type { ClientMessage } from "../types/clientMessages";

// Game State
interface GameState {
  playerId: string;
  lobbyData: Player[];
  gameStage: string;
}

const initialGameState: GameState = {
  playerId: "",
  lobbyData: [],
  gameStage: "lobby",
};

function gameReducer(state: GameState, message: ServerMessage): GameState {
  switch (message.type) {
    case "JOINED":
      return {
        ...state,
        playerId: message.payload.playerId,
      };

    case "LOBBY_DATA":
      return {
        ...state,
        lobbyData: message.payload.players,
      };

    case "GAME_STAGE":
      return {
        ...state,
        gameStage: message.payload.stage,
      };

    case "ERROR":
      console.error("Server error:", message.payload.message);
      return state;

    case "PONG":
      return state;

    default:
      const _exhaustive: never = message;
      console.warn("Unhandled message type:", _exhaustive);
      return state;
  }
}

// Context Types
type ConnectionStatus = "disconnected" | "connecting" | "connected";

interface GameContextValue {
  // State
  state: GameState;
  status: ConnectionStatus;

  // Actions
  connect: (playerName: string) => void;
  sendMessage: <T extends ClientMessage>(message: T) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// Provider
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);

  const onMessage = useCallback((evt: MessageEvent) => {
    const msg: ServerMessage = JSON.parse(evt.data);
    dispatch(msg);
  }, []);

  const connect = useCallback(
    (playerName: string) => {
      setStatus("connecting");
      const url = import.meta.env.VITE_WS_URL ?? "ws://localhost:8080/ws";
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        ws.send(JSON.stringify({ type: "JOIN", payload: { playerName } }));
      };
      ws.onclose = () => setStatus("disconnected");
      ws.onerror = () => setStatus("disconnected");
      ws.onmessage = onMessage;
    },
    [onMessage]
  );

  const sendMessage = useCallback(<T extends ClientMessage>(message: T) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected, cannot send message");
      return;
    }
    ws.send(JSON.stringify(message));
  }, []);

  const value: GameContextValue = {
    state,
    status,
    connect,
    sendMessage,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Consumer Hook
export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
