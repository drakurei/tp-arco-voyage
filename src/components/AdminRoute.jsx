import { Link, Navigate, Outlet } from "react-router-dom"
import { Button } from "react-bootstrap"
import { useSelector } from "react-redux"
import { selectUser } from "../features/auth/authSlice"

// Protège les routes d'administration :
// - personne n'est connecté : on redirige vers la page de connexion
// - connecté sans le rôle "admin" : on affiche un message d'accès refusé
function AdminRoute() {
  const user = useSelector(selectUser)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== "admin") {
    return (
      <div className="text-page">
        <p className="eyebrow">Accès réservé</p>
        <h1 className="mb-4">Cette page est réservée aux administrateurs</h1>
        <p>
          Votre compte <strong>@{user.username}</strong> n'a pas le rôle administrateur.
          Si vous pensez que c'est une erreur, contactez l'équipe du site.
        </p>
        <Button as={Link} to="/profile" variant="primary" className="mt-2">
          Retour à mon profil
        </Button>
      </div>
    )
  }

  // Rôle admin : on affiche la page demandée
  return <Outlet />
}

export default AdminRoute
