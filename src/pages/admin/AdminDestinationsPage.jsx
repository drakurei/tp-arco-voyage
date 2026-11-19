import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Alert, Button, Table } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { selectUser } from "../../features/auth/authSlice"
import { deleteDestination, fetchDestinations, selectDestinations } from "../../features/destinations/destinationsSlice"
import { fetchUsers, selectUsers } from "../../features/users/usersSlice"
import { ErrorNote, LoadingLines } from "../../components/PageStatus"
import ConfirmModal from "../../components/ConfirmModal"
import SafeImage from "../../components/SafeImage"
import { plural } from "../../utils/format"
import { SortableTh, TableFilter } from "../../components/TableTools"
import { useTableControls } from "../../utils/useTableControls"

const COLUMNS = {
  name: (d) => d.name,
  region: (d) => d.regionName,
  capital: (d) => d.capital,
  author: (d) => d.createdBy ?? 0,
}
const searchIn = (d) => `${d.name} ${d.slug} ${d.capital} ${d.regionName}`

// Liste des destinations (tableau) ; seul l'admin qui a créé une destination peut la supprimer
function AdminDestinationsPage() {
  const dispatch = useDispatch()
  const location = useLocation()
  const me = useSelector(selectUser)
  const destinations = useSelector(selectDestinations)
  const users = useSelector(selectUsers)
  const { listStatus, listError } = useSelector((state) => state.destinations)
  // message laissé par la page de création
  const [created, setCreated] = useState(location.state?.created ?? null)

  const [toDelete, setToDelete] = useState(null)
  const table = useTableControls(destinations, { columns: COLUMNS, searchIn, initial: { key: "name", direction: "asc" } })
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    dispatch(fetchDestinations())
    // la liste des comptes sert à afficher le nom du créateur
    dispatch(fetchUsers())
  }, [dispatch])

  const authorOf = (destination) => {
    if (destination.createdBy === me.id) return "vous"
    const author = users.find((u) => u.id === destination.createdBy)
    return author ? `@${author.username}` : destination.createdBy ? `n°${destination.createdBy}` : "inconnu"
  }

  const confirmDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await dispatch(deleteDestination(toDelete.id)).unwrap()
      setToDelete(null)
    } catch (message) {
      setDeleteError(String(message))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="page-head mb-2">
        <h1 className="mb-0">Destinations</h1>
        <Button as={Link} to="/admin/destinations/new" variant="primary">
          Nouvelle destination
        </Button>
      </div>
      <p className="capital mb-4">
        {listStatus === "succeeded" && `${plural(destinations.length, "destination")}. Vous pouvez supprimer celles que vous avez créées.`}
      </p>

      {created && (
        <Alert variant="success" dismissible onClose={() => setCreated(null)}>
          La destination <strong>{created}</strong> est publiée.
        </Alert>
      )}

      {listStatus === "loading" && destinations.length === 0 && <LoadingLines lines={5} />}
      {listStatus === "failed" && <ErrorNote message={listError} onRetry={() => dispatch(fetchDestinations())} />}

      {destinations.length > 0 && (
        <>
        <TableFilter id="filter-destinations" value={table.filter} onChange={table.setFilter} shown={table.rows.length} total={destinations.length} placeholder="Pays, capitale, région…" />
        <div className="admin-sheet">
          <Table responsive className="admin-table mb-0">
            <thead>
              <tr>
                <SortableTh label="Destination" column="name" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Région" column="region" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Capitale" column="capital" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Créée par" column="author" sort={table.sort} onSort={table.toggleSort} />
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="admin-person">
                      <SafeImage src={d.image} width="48" height="36" className="admin-thumb" loading="lazy" />
                      <Link to={`/destinations/${d.slug}`}>{d.name}</Link>
                    </div>
                  </td>
                  <td>{d.regionName}</td>
                  <td>{d.capital}</td>
                  <td className={d.createdBy === me.id ? "fw-bold" : undefined}>{authorOf(d)}</td>
                  <td className="text-end">
                    {d.createdBy === me.id && (
                      <Button variant="link" className="p-0 link-danger" onClick={() => setToDelete(d)}>
                        Supprimer
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        </>
      )}

      <ConfirmModal
        show={!!toDelete}
        title="Supprimer cette destination ?"
        confirmLabel="Supprimer définitivement"
        danger
        pending={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onHide={() => {
          setToDelete(null)
          setDeleteError(null)
        }}
      >
        <p className="mb-0">
          <strong>{toDelete?.name}</strong> disparaîtra du site, avec sa fiche. Cette action ne peut pas être annulée.
        </p>
      </ConfirmModal>
    </>
  )
}

export default AdminDestinationsPage
