import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardRouter from "./assets/pages/dashboard/DashboardRouter";
import BookingListPage from "./assets/pages/bookings/BookingListPage";
import ResourceDetailPage from "./assets/pages/resources/ResourceDetailPage";
import ResourceFormPage from "./assets/pages/resources/ResourceFormPage";
import ResourceListPage from "./assets/pages/resources/ResourceListPage";
import "./assets/styles/dashboard.css";

function App() {
  const role = "ADMIN"; // test role until login is implemented

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardRouter role={role} />} />

        <Route path="/bookings" element={<BookingListPage />} />
        <Route path="/resources" element={<ResourceListPage />} />
        <Route path="/resources/new" element={<ResourceFormPage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route path="/resources/:id/edit" element={<ResourceFormPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

//application