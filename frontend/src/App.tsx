import "./App.css";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  return (
    <>
      <nav class="navbar">
        <h1 class="logo">Leema</h1>
      </nav>
      <div class="page-wrapper">
        <DashboardPage />
      </div>
    </>
  );
}

export default App;
