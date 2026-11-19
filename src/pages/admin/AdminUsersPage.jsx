import { useEffect, useState } from "react"
import { Button, Table } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { selectUser } from "../../features/auth/authSlice"
import { adminChangePassword, fetchUsers, selectUsers } from "../../features/users/usersSlice"
import { ErrorNote, LoadingLines } from "../../components/PageStatus"
import PasswordModal from "../../components/PasswordModal"
import { avatarUrl } from "../../utils/avatar"
import { formatDay, plural } from "../../utils/format"
import { SortableTh, TableFilter } from "../../components/TableTools"
import { useTableControls } from "../../utils/useTableControls"

// Colonnes triables et texte filtré (en dehors du composant : ne changent jamais)
const COLUMNS = {
  name: (u) => `${u.lastName} ${u.firstName}`,
  email: (u) => u.email,
  role: (u) => u.role,
  createdAt: (u) => u.createdAt ?? "",
}
const searchIn = (u) => `${u.username} ${u.firstName} ${u.lastName} ${u.email} ${u.role}`

// GET /api/users/index.php : liste des comptes (admin)
// L'admin peut changer le mot de passe de n'importe quel compte
function AdminUsersPage() {
  const dispatch = useDispatch()
  const me = useSelector(selectUser)
  const users = useSelector(selectUsers)
  const { status, error } = useSelector((state) => state.users)
  // compte dont on change le mot de passe
  const [target, setTarget] = useState(null)
  const table = useTableControls(users, { columns: COLUMNS, searchIn, initial: { key: "createdAt", direction: "desc" } })

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  return (
    <>
      <h1 className="mb-2">Voyageurs</h1>
      <p className="capital mb-4">{status === "succeeded" && plural(users.length, "compte")}</p>

      {status === "loading" && users.length === 0 && <LoadingLines lines={5} />}
      {status === "failed" && <ErrorNote message={error} onRetry={() => dispatch(fetchUsers())} />}

      {users.length > 0 && (
        <>
        <TableFilter id="filter-users" value={table.filter} onChange={table.setFilter} shown={table.rows.length} total={users.length} placeholder="Nom, login, email…" />
        <div className="admin-sheet">
          <Table responsive className="admin-table mb-0">
            <thead>
              <tr>
                <SortableTh label="Voyageur" column="name" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Email" column="email" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Rôle" column="role" sort={table.sort} onSort={table.toggleSort} />
                <SortableTh label="Inscrit le" column="createdAt" sort={table.sort} onSort={table.toggleSort} />
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="admin-person">
                      <img src={u.avatar || avatarUrl(u.username)} alt="" width="36" height="36" loading="lazy" />
                      <span>
                        {u.firstName} {u.lastName}
                        <br />
                        <span className="capital">@{u.username}</span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${u.email}`}>{u.email}</a>
                  </td>
                  <td>
                    <span className={u.role === "admin" ? "role-chip role-chip-admin" : "role-chip"}>
                      {u.role === "admin" ? "admin" : "membre"}
                    </span>
                  </td>
                  <td className="text-nowrap">{formatDay(u.createdAt)}</td>
                  <td className="text-end text-nowrap">
                    <Button variant="link" className="p-0" onClick={() => setTarget(u)}>
                      Changer le mot de passe
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        </>
      )}

      <PasswordModal
        show={!!target}
        onHide={() => setTarget(null)}
        askCurrent={false}
        title="Nouveau mot de passe"
        subtitle={
          target &&
          (target.id === me.id
            ? "Il s'agit de votre propre compte."
            : `Pour le compte @${target.username}. Pensez à lui communiquer le nouveau mot de passe.`)
        }
        onSubmit={(passwords) => dispatch(adminChangePassword({ userId: target.id, ...passwords })).unwrap()}
      />
    </>
  )
}

export default AdminUsersPage
