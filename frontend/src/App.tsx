import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardRouter from "./assets/pages/dashboard/DashboardRouter";
import CreateTicketPage from "./assets/pages/tickets/CreateTicketPage.tsx";
import MyTicketsPage from "./assets/pages/tickets/MyTicketsPage.tsx";
import TicketDetailPage from "./assets/pages/tickets/TicketDetailPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardRouter role="USER"/>} />
        <Route path="/tickets/create" element={<CreateTicketPage />} />
        <Route path="/tickets" element={<MyTicketsPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;