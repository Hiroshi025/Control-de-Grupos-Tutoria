import { ProtectedRoute } from "@/components/auth/protected-route"
import { AlumnoDashboard } from "@/components/dashboard/alumno/alumno-dashboard"

export default function AlumnoDashboardPage() {
  return (
    <ProtectedRoute allowedUserTypes={["alumno"]}>
      <AlumnoDashboard />
    </ProtectedRoute>
  )
}
