import { Link } from "react-router-dom"
import { Button, Table } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { deleteMessage, selectMessages } from "../features/contact/contactSlice"

// Date lisible : "18/11/2026 à 14:05"
function formatDate(iso) {
  const date = new Date(iso)
  return `${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
}

// Administration : réservée au rôle "admin" (voir AdminRoute)
// Équivalent de GET /api/contact/index.php : toutes les demandes de contact
function AdminPage() {
  const dispatch = useDispatch()
  const messages = useSelector(selectMessages)

  return (
    <>
      <p className="eyebrow">Administration</p>
      <h1 className="mb-2">Demandes de contact</h1>
      <p className="capital mb-4">
        {messages.length === 0
          ? "Aucune demande pour l'instant."
          : `${messages.length} demande${messages.length > 1 ? "s" : ""}, de la plus récente à la plus ancienne.`}
      </p>

      {messages.length === 0 ? (
        <div className="text-page">
          <p>
            Les messages envoyés depuis la page <Link to="/contact">Contact</Link> apparaîtront ici,
            avec le compte de la personne si elle était connectée.
          </p>
        </div>
      ) : (
        <div className="admin-sheet">
          <Table responsive className="admin-table mb-0">
            <thead>
              <tr>
                <th>Reçu le</th>
                <th>Expéditeur</th>
                <th>Sujet et message</th>
                <th>Compte</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id}>
                  <td className="text-nowrap">{formatDate(m.sentAt)}</td>
                  <td>
                    {m.name}
                    <br />
                    <a href={`mailto:${m.email}`}>{m.email}</a>
                  </td>
                  <td>
                    <strong>{m.subject}</strong>
                    <p className="admin-message mb-0">{m.message}</p>
                  </td>
                  <td>{m.username ? `@${m.username}` : <span className="capital">visiteur</span>}</td>
                  <td>
                    <Button variant="link" className="px-0" onClick={() => dispatch(deleteMessage(m.id))}>
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </>
  )
}

export default AdminPage
