import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminDashboard } from "@/components/dashboard/admin/admin-dashboard"

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedUserTypes={["administrador"]}>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
