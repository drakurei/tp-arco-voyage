import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button, Table } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { deleteComment, fetchAllComments } from "../../features/comments/commentsSlice"
import { ErrorNote, LoadingLines } from "../../components/PageStatus"
import ConfirmModal from "../../components/ConfirmModal"
import { RatingPunch } from "../../components/Rating"
import { formatDateTime, plural } from "../../utils/format"
import { SortableTh, TableFilter } from "../../components/TableTools"
import { useTableControls } from "../../utils/useTableControls"

const COLUMNS = {
  createdAt: (c) => c.createdAt ?? "",
  destination: (c) => c.destinationName,
  author: (c) => c.username,
  rating: (c) => c.rating ?? 0,
}
const searchIn = (c) => `${c.content} ${c.username} ${c.destinationName}`

// Tous les commentaires : le site est responsable de ce qui est publié,
// l'admin peut supprimer n'importe quel commentaire
function AdminCommentsPage() {
  const dispatch = useDispatch()
  const { all: comments, allStatus, allError } = useSelector((state) => state.comments)
  const [toDelete, setToDelete] = useState(null)
  const table = useTableControls(comments, { columns: COLUMNS, searchIn, initial: { key: "createdAt", direction: "desc" } })
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    dispatch(fetchAllComments())
  }, [dispatch])

  const confirmDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await dispatch(deleteComment(toDelete.id)).unwrap()
      setToDelete(null)
    } catch (message) {
      setDeleteError(String(message))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <h1 className="mb-2">Commentaires</h1>
      <p className="capital mb-4">{allStatus === "succeeded" && plural(comments.length, "commentaire")}</p>

      {allStatus === "loading" && comments.length === 0 && <LoadingLines lines={5} />}
      {allStatus === "failed" && <ErrorNote message={allError} onRetry={() => dispatch(fetchAllComments())} />}
      {allStatus === "succeeded" && comments.length === 0 && <p>Aucun commentaire publié pour l'instant.</p>}

      {comments.length > 0 && (
        <>
        <TableFilter id="filter-comments" value={table.filter} onChange={table.setFilter} shown={table.rows.length} total={comments.length} placeholder="Mot du commentaire, auteur, pays…" />
        <div className="admin-sheet">
          <Table responsive className="admin-table mb-0">
            <thead>
              <tr>
                <SortableTh label="Publié le" column="createdAt" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Destination" column="destination" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Auteur" column="author" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Note et commentaire" column="rating" sort={table.sort} onSort={table.toggleSort} />
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((c) => (
                <tr key={c.id}>
                  <td className="text-nowrap">{formatDateTime(c.createdAt)}</td>
                  <td>
                    <Link to={`/destinations/${c.destinationSlug}`}>{c.destinationName}</Link>
                  </td>
                  <td>
                    {c.username ? (
                      <Link to={`/voyageurs/${encodeURIComponent(c.username)}`}>@{c.username}</Link>
                    ) : (
                      `n°${c.userId}`
                    )}
                  </td>
                  <td>
                    <RatingPunch value={c.rating} />
                    <p className="admin-message mb-0">{c.content}</p>
                  </td>
                  <td className="text-end">
                    <Button variant="link" className="p-0 link-danger" onClick={() => setToDelete(c)}>
                      Supprimer
                    </Button>
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
        title="Supprimer ce commentaire ?"
        confirmLabel="Supprimer"
        danger
        pending={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onHide={() => {
          setToDelete(null)
          setDeleteError(null)
        }}
      >
        {toDelete && (
          <>
            <p>
              Commentaire de <strong>{toDelete.username ? `@${toDelete.username}` : "ce voyageur"}</strong> sur{" "}
              {toDelete.destinationName} :
            </p>
            <blockquote className="quote-preview">{toDelete.content}</blockquote>
            <p className="mb-0">Il sera retiré du site. Cette action ne peut pas être annulée.</p>
          </>
        )}
      </ConfirmModal>
    </>
  )
}

export default AdminCommentsPage
