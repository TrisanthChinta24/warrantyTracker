import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ServiceHistoryPage from "./pages/ServiceHistoryPage";
import WarrantyDetailsPage from "./pages/WarrantyDetailsPage";
import WarrantyFormPage from "./pages/WarrantyFormPage";
import WarrantyListPage from "./pages/WarrantyListPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/warranties" element={<WarrantyListPage />} />
        <Route path="/service-history" element={<ServiceHistoryPage />} />
        <Route path="/warranties/new" element={<WarrantyFormPage />} />
        <Route path="/warranties/:id/edit" element={<WarrantyFormPage />} />
        <Route path="/warranties/:id" element={<WarrantyDetailsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
