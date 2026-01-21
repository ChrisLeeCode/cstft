import Home from "./pages/Home/Home";
import { GameProvider } from "./context/GameContext";

export default function App() {
  return (
    <GameProvider>
      <Home />
    </GameProvider>
  );
}
