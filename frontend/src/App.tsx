import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TicketProvider } from "./assets/context/TicketContext";
import DashboardRouter from "./assets/pages/dashboard/DashboardRouter";
import CreateTicketPage from "./assets/pages/tickets/CreateTicketPage";
import MyTicketsPage from "./assets/pages/tickets/MyTicketsPage";
import TicketDetailPage from "./assets/pages/tickets/TicketDetailPage";
import TechnicianTicketsPage from "./assets/pages/tickets/TechnicianTicketsPage";
import TechnicianTicketDetailPage from "./assets/pages/tickets/TechnicianTicketDetailPage";

function App() {
  return (
    <TicketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardRouter role="USER" />} />
          <Route path="/technician" element={<DashboardRouter role="TECHNICIAN" />} />
          <Route path="/tickets/create" element={<CreateTicketPage />} />
          <Route path="/tickets" element={<MyTicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/technician/tickets" element={<TechnicianTicketsPage />} />
          <Route path="/technician/tickets/:id" element={<TechnicianTicketDetailPage />} />
        </Routes>
      </BrowserRouter>
    </TicketProvider>
  );
}

export default App;