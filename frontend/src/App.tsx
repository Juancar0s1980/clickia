import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/layout/AdminRoute";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AdminConversationDetailPage } from "./pages/admin/AdminConversationDetailPage";
import { AdminNetworkStatusPage } from "./pages/admin/AdminNetworkStatusPage";
import { AdminTicketsPage } from "./pages/admin/AdminTicketsPage";
import { AdminUserConversationsPage } from "./pages/admin/AdminUserConversationsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { MyTicketsPage } from "./pages/MyTicketsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlansPage } from "./pages/PlansPage";
import { RegisterPage } from "./pages/RegisterPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/planes" element={<PlansPage />} />
          <Route path="/tickets" element={<MyTicketsPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminUsersPage />} />
            <Route path="/admin/users/:userId" element={<AdminUserConversationsPage />} />
            <Route path="/admin/conversations/:id" element={<AdminConversationDetailPage />} />
            <Route path="/admin/network-status" element={<AdminNetworkStatusPage />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
