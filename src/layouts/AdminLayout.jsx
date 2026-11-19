import { NavLink, Outlet } from "react-router-dom"

// Administration : un registre avec son index à gauche
const SECTIONS = [
  { to: "/admin", label: "Sommaire", end: true },
  { to: "/admin/contacts", label: "Demandes de contact" },
  { to: "/admin/users", label: "Voyageurs" },
  { to: "/admin/destinations", label: "Destinations" },
  { to: "/admin/comments", label: "Commentaires" },
]

function AdminLayout() {
  return (
    <div className="ledger">
      <nav className="ledger-index" aria-label="Administration">
        <p className="ledger-title">Registre</p>
        <ol>
          {SECTIONS.map((section) => (
            <li key={section.to}>
              <NavLink to={section.to} end={section.end}>
                {section.label}
              </NavLink>
            </li>
          ))}
        </ol>
      </nav>
      <div className="ledger-page">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
