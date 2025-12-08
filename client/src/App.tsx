import React, { useEffect, useRef, useState } from "react";
import Home from "./pages/Home/Home";

type ServerMsg = {
  type: string;
  payload: any;
  timestamp?: number;
};

export default function App() {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [taken, setTaken] = useState<Record<string, number>>({}); // choice -> playerId
  const [log, setLog] = useState<string[]>([]);
  const [bothReady, setBothReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    setStatus("connecting");
    const url = (import.meta as any).env?.VITE_WS_URL ?? "ws://localhost:8080/ws";
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      // Send join as first message
      const join = { type: "join", payload: { name } };
      ws.send(JSON.stringify(join));
    };
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");

    ws.onmessage = (evt) => {
      const msg: ServerMsg = JSON.parse(evt.data);
      switch (msg.type) {
        case "joined":
          setPlayerId(msg.payload.playerId);
          setLog((l) => [
            `Joined as Player ${msg.payload.playerId}`,
            ...l,
          ]);
          break;
        case "waiting":
          setBothReady(false);
          setTaken({});
          setLog((l) => [msg.payload.message, ...l]);
          break;
        case "ready":
          setBothReady(true);
          if (msg.payload.takenChoices) {
            // invert to choice->playerId for convenience
            const inv: Record<string, number> = {};
            for (const [pid, choice] of Object.entries(msg.payload.takenChoices)) {
              inv[String(choice)] = Number(pid);
            }
            setTaken(inv);
          }
          setLog((l) => [msg.payload.message || "Both players connected", ...l]);
          break;
        case "choice_update": {
          const inv: Record<string, number> = {};
          for (const [pid, choice] of Object.entries(msg.payload.takenChoices)) {
            inv[String(choice)] = Number(pid);
          }
          setTaken(inv);
          break;
        }
        case "result":
          setLog((l) => [
            `Flip: ${msg.payload.flip}. Winner: Player ${msg.payload.winnerPlayerId}`,
            ...l,
          ]);
          // round resets server-side; free up buttons client-side
          setTaken({});
          break;
        case "error":
          setLog((l) => [String(msg.payload?.message ?? "error"), ...l]);
          break;
        default:
          // keep a trace for debugging
          setLog((l) => [`${msg.type}: ${JSON.stringify(msg.payload)}`, ...l]);
      }
    };
  };

  const choose = (choice: "heads" | "tails") => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "choose", payload: { choice }, timestamp: Date.now() }));
  };

  const choiceTakenByOther = (choice: "heads" | "tails") => {
    const pid = taken[choice];
    return pid != null && pid !== playerId; // taken by the other player
  };

  return (
    <Home/>
    // <div className="min-h-screen p-6 grid gap-4">
    //   <header className="flex items-center justify-between">
    //     <h1 className="text-2xl font-bold">Heads or Tails (2‑player)</h1>
    //     <span className={`px-2 py-1 rounded-full text-sm ${status === "connected" ? "bg-green-200" : status === "connecting" ? "bg-yellow-200" : "bg-red-200"}`}>{status}</span>
    //   </header>

    //   {status !== "connected" ? (
    //     <div className="flex gap-2 items-center">
    //       <input className="border rounded px-3 py-2" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
    //       <button className="rounded px-4 py-2 bg-black text-white" onClick={connect}>Join game</button>
    //     </div>
    //   ) : (
    //     <div className="text-sm opacity-80">You are Player {playerId ?? "?"}</div>
    //   )}

    //   <div className="flex gap-3">
    //     <button
    //       disabled={!bothReady || !!taken["heads"] || choiceTakenByOther("heads")}
    //       className={`rounded px-4 py-2 border ${taken["heads"] ? "opacity-50" : ""}`}
    //       onClick={() => choose("heads")}
    //     >
    //       Heads {taken["heads"] ? `(taken by P${taken["heads"]})` : ""}
    //     </button>
    //     <button
    //       disabled={!bothReady || !!taken["tails"] || choiceTakenByOther("tails")}
    //       className={`rounded px-4 py-2 border ${taken["tails"] ? "opacity-50" : ""}`}
    //       onClick={() => choose("tails")}
    //     >
    //       Tails {taken["tails"] ? `(taken by P${taken["tails"]})` : ""}
    //     </button>
    //   </div>

    //   <section>
    //     <h2 className="font-semibold">Game log</h2>
    //     <ul className="grid gap-2">
    //       {log.map((line, i) => (
    //         <li key={i} className="border rounded p-2 text-sm">{line}</li>
    //       ))}
    //     </ul>
    //   </section>
    // </div>
  )
}