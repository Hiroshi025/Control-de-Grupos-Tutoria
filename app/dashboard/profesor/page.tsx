import { ProtectedRoute } from "@/components/auth/protected-route"
import { ProfesorDashboard } from "@/components/dashboard/profesor/profesor-dashboard"

export default function ProfesorDashboardPage() {
  return (
    <ProtectedRoute allowedUserTypes={["profesor"]}>
      <ProfesorDashboard />
    </ProtectedRoute>
  )
}
