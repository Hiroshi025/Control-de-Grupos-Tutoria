import { ProtectedRoute } from "@/components/auth/protected-route"
import { GrupoDashboard } from "@/components/dashboard/profesor/grupo-dashboard"

interface GrupoPageProps {
  params: {
    grupoId: string
  }
}

export default function GrupoPage({ params }: GrupoPageProps) {
  return (
    <ProtectedRoute allowedUserTypes={["profesor"]}>
      <GrupoDashboard grupoId={params.grupoId} />
    </ProtectedRoute>
  )
}
