import DashboardRouter from "./assets/pages/dashboard/DashboardRouter";
import "./assets/styles/dashboard.css";

function App() {
  const role = "ADMIN"; // test role

  return <DashboardRouter role={role} />;
}

export default App;