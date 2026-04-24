import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TicketProvider } from "./assets/context/TicketContext";
import DashboardRouter from "./assets/pages/dashboard/DashboardRouter";
import CreateTicketPage from "./assets/pages/tickets/CreateTicketPage";
import MyTicketsPage from "./assets/pages/tickets/MyTicketsPage";
import TicketDetailPage from "./assets/pages/tickets/TicketDetailPage";
import TechnicianTicketsPage from "./assets/pages/tickets/TechnicianTicketsPage";
import TechnicianTicketDetailPage from "./assets/pages/tickets/TechnicianTicketDetailPage";
import AdminTicketsPage from "./assets/pages/tickets/AdminTicketsPage";
import AdminTicketDetailPage from "./assets/pages/tickets/AdminTicketDetailPage";

function App() {
  return (
    <TicketProvider>
      <BrowserRouter>
        <Routes>
          {/* User routes */}
          <Route path="/" element={<DashboardRouter role="USER" />} />
          <Route path="/tickets/create" element={<CreateTicketPage />} />
          <Route path="/tickets" element={<MyTicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />

          {/* Technician routes */}
          <Route path="/technician" element={<DashboardRouter role="TECHNICIAN" />} />
          <Route path="/technician/tickets" element={<TechnicianTicketsPage />} />
          <Route path="/technician/tickets/:id" element={<TechnicianTicketDetailPage />} />

          {/* Admin routes */}
          <Route path="/admin" element={<DashboardRouter role="ADMIN" />} />
          <Route path="/admin/tickets" element={<AdminTicketsPage />} />
          <Route path="/admin/tickets/:id" element={<AdminTicketDetailPage />} />
        </Routes>
      </BrowserRouter>
    </TicketProvider>
  );
}

export default App;