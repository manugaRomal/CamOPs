import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminOnlyRoute } from "./auth/AdminOnlyRoute";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import LoginPage from "./assets/pages/LoginPage";
import DashboardRouter from "./assets/pages/dashboard/DashboardRouter";
import BookingListPage from "./assets/pages/bookings/BookingListPage";
import ResourceDetailPage from "./assets/pages/resources/ResourceDetailPage";
import ResourceFormPage from "./assets/pages/resources/ResourceFormPage";
import ResourceListPage from "./assets/pages/resources/ResourceListPage";
import AuthCallbackPage from "./assets/pages/auth/AuthCallbackPage";
import NotificationsPage from "./assets/pages/notifications/NotificationsPage";
import ProfilePage from "./assets/pages/profile/ProfilePage";
import "./assets/styles/dashboard.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourceListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources/new"
            element={
              <ProtectedRoute>
                <AdminOnlyRoute>
                  <ResourceFormPage />
                </AdminOnlyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources/:id"
            element={
              <ProtectedRoute>
                <ResourceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources/:id/edit"
            element={
              <ProtectedRoute>
                <AdminOnlyRoute>
                  <ResourceFormPage />
                </AdminOnlyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
