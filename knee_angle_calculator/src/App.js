import "./App.css";
import Home from "./pages/Home";
import { AngleContextProvider } from "./contexts/AngleContext";

function App() {
  return (
    <>
      <AngleContextProvider>
        <Home />
      </AngleContextProvider>
    </>
  );
}

export default App;
