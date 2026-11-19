import { NavLink, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectUser } from "../features/auth/authSlice"

// Espace personnel : trois sous-pages rangées comme des marque-pages
function ProfileLayout() {
  const user = useSelector(selectUser)

  return (
    <>
      <nav className="bookmarks" aria-label={`Espace de ${user?.firstName ?? "voyageur"}`}>
        <NavLink to="/profile" end>
          Passeport
        </NavLink>
        <NavLink to="/profile/favorites">Favoris</NavLink>
        <NavLink to="/profile/comments">Commentaires</NavLink>
      </nav>
      <Outlet />
    </>
  )
}

export default ProfileLayout
