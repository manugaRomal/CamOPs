import DashboardRouter from "./assets/pages/dashboard/DashboardRouter";
import "./assets/styles/dashboard.css";

function App() {
  const role = " USER"; // test role

  return <DashboardRouter role={role} />;
}

export default App;