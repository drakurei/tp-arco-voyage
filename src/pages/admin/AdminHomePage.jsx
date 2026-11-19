import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { selectUser } from "../../features/auth/authSlice"
import { fetchContacts } from "../../features/contact/contactSlice"
import { fetchUsers } from "../../features/users/usersSlice"
import { fetchDestinations } from "../../features/destinations/destinationsSlice"
import { fetchAllComments } from "../../features/comments/commentsSlice"

// Sommaire du registre : chaque rubrique avec son nombre d'entrées, comme une table des matières
function AdminHomePage() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const contacts = useSelector((state) => state.contact)
  const users = useSelector((state) => state.users)
  const destinations = useSelector((state) => state.destinations)
  const comments = useSelector((state) => state.comments)

  useEffect(() => {
    dispatch(fetchContacts())
    dispatch(fetchUsers())
    dispatch(fetchDestinations())
    dispatch(fetchAllComments())
  }, [dispatch])

  // nombre d'entrées, ou un état lisible pendant le chargement / en cas d'erreur
  const count = (status, list) => (status === "succeeded" ? list.length : status === "failed" ? "erreur" : "…")
  const mine = destinations.list.filter((d) => d.createdBy === user.id).length

  const rows = [
    { to: "/admin/contacts", label: "Demandes de contact", value: count(contacts.listStatus, contacts.list) },
    { to: "/admin/users", label: "Voyageurs inscrits", value: count(users.status, users.list) },
    { to: "/admin/destinations", label: "Destinations publiées", value: count(destinations.listStatus, destinations.list) },
    { to: "/admin/comments", label: "Commentaires", value: count(comments.allStatus, comments.all) },
  ]

  return (
    <>
      <h1 className="mb-2">Sommaire</h1>
      <p className="capital mb-4">Bonjour {user.firstName}, voici l'état du carnet aujourd'hui.</p>

      <ol className="toc">
        {rows.map((row) => (
          <li key={row.to}>
            <Link to={row.to}>
              <span className="toc-label">{row.label}</span>
              <span className="toc-leader" aria-hidden="true" />
              <span className="toc-value">{row.value}</span>
            </Link>
          </li>
        ))}
      </ol>

      {destinations.listStatus === "succeeded" && (
        <p className="mt-4 mb-0">
          Vous avez publié {mine === 0 ? "aucune destination" : mine === 1 ? "une destination" : `${mine} destinations`}.{" "}
          <Link to="/admin/destinations/new">Ajouter une destination</Link>
        </p>
      )}
    </>
  )
}

export default AdminHomePage
