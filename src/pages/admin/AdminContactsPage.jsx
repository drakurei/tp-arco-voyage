import { useEffect } from "react"
import { Link } from "react-router-dom"
import { Table } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { fetchContacts, selectContacts } from "../../features/contact/contactSlice"
import { ErrorNote, LoadingLines } from "../../components/PageStatus"
import { formatDateTime, plural } from "../../utils/format"
import { SortableTh, TableFilter } from "../../components/TableTools"
import { useTableControls } from "../../utils/useTableControls"

const COLUMNS = {
  createdAt: (c) => c.createdAt ?? "",
  name: (c) => c.name,
  subject: (c) => c.subject,
  account: (c) => c.username ?? "",
}
const searchIn = (c) => `${c.name} ${c.email} ${c.subject} ${c.message} ${c.username ?? ""}`

// GET /api/contact/index.php : toutes les demandes de contact (admin)
function AdminContactsPage() {
  const dispatch = useDispatch()
  const contacts = useSelector(selectContacts)
  const { listStatus, listError } = useSelector((state) => state.contact)
  const table = useTableControls(contacts, { columns: COLUMNS, searchIn, initial: { key: "createdAt", direction: "desc" } })

  useEffect(() => {
    dispatch(fetchContacts())
  }, [dispatch])

  return (
    <>
      <h1 className="mb-2">Demandes de contact</h1>
      <p className="capital mb-4">
        {listStatus === "succeeded" && plural(contacts.length, "demande")}
      </p>

      {listStatus === "loading" && contacts.length === 0 && <LoadingLines lines={5} />}
      {listStatus === "failed" && <ErrorNote message={listError} onRetry={() => dispatch(fetchContacts())} />}

      {listStatus === "succeeded" && contacts.length === 0 && (
        <p>
          Aucune demande pour l'instant. Les messages envoyés depuis la page <Link to="/contact">Contact</Link>{" "}
          arriveront ici.
        </p>
      )}

      {contacts.length > 0 && (
        <>
        <TableFilter id="filter-contacts" value={table.filter} onChange={table.setFilter} shown={table.rows.length} total={contacts.length} placeholder="Nom, email, sujet, mot du message…" />
        <div className="admin-sheet">
          <Table responsive className="admin-table mb-0">
            <thead>
              <tr>
                <SortableTh label="Reçue le" column="createdAt" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Expéditeur" column="name" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Sujet et message" column="subject" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Compte" column="account" sort={table.sort} onSort={table.toggleSort} />
              </tr>
            </thead>
            <tbody>
              {table.rows.map((c) => (
                <tr key={c.id}>
                  <td className="text-nowrap">{formatDateTime(c.createdAt)}</td>
                  <td>
                    {c.name}
                    <br />
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </td>
                  <td>
                    <strong>{c.subject}</strong>
                    <p className="admin-message mb-0">{c.message}</p>
                  </td>
                  <td className="text-nowrap">
                    {c.username ? `@${c.username}` : c.userId ? `n°${c.userId}` : <span className="capital">visiteur</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        </>
      )}
    </>
  )
}

export default AdminContactsPage
