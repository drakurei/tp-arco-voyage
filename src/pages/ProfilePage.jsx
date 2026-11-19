import { useState } from "react"
import { Link } from "react-router-dom"
import { Button, Col, Row } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { selectUser } from "../features/auth/authSlice"
import { selectFavorites } from "../features/favorites/favoritesSlice"
import { changeMyPassword } from "../features/users/usersSlice"
import { avatarUrl } from "../utils/avatar"
import { formatLongDate } from "../utils/format"
import ProfileEditModal from "../components/ProfileEditModal"
import PasswordModal from "../components/PasswordModal"
import SafeImage from "../components/SafeImage"

const ROLE_LABELS = { admin: "Administrateur", membre: "Voyageur" }
const GENDER_LABELS = { male: "Homme", female: "Femme", other: "Autre" }

// Une ligne "libellé : valeur", affichée seulement si la valeur existe
function Info({ label, value }) {
    if (value === undefined || value === null || value === "") return null
    return (
        <div>
            <dt>{label}</dt>
            <dd>{value}</dd>
        </div>
    )
}

// Bande de lecture d'un passeport : lettres majuscules sans accent, le reste devient "<"
function mrzText(value) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "<")
}

function mrzLines(user) {
    const line1 = `P<ARC${mrzText(user.lastName)}<<${mrzText(user.firstName)}`
    const sex = user.gender === "male" ? "M" : user.gender === "female" ? "F" : "<"
    const since = (user.createdAt ?? "").slice(2, 10).replace(/-/g, "") || "<<<<<<"
    const line2 = `${mrzText(user.username).padEnd(9, "<").slice(0, 9)}<ARC${since}${sex}${String(user.id ?? 0).padStart(6, "0")}`
    return [line1.padEnd(44, "<").slice(0, 44), line2.padEnd(44, "<").slice(0, 44)]
}

// Page profil : les données de l'utilisateur connecté (gardées dans authSlice)
function ProfilePage () {
    const dispatch = useDispatch()
    const user = useSelector(selectUser)
    const favorites = useSelector(selectFavorites)
    const [editing, setEditing] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)

    const photo = user.avatar || user.image || avatarUrl(user.username)
    const role = user.role ?? "membre"
    const [mrz1, mrz2] = mrzLines(user)

    return (
        <Row className="g-5">
            <Col lg={7}>
                {/* Page de données d'un passeport */}
                <section className="passport" aria-labelledby="passport-name">
                    <p className="passport-title">Passeport arco-voyage</p>

                    <div className="passport-body">
                        <figure className="passport-photo">
                            <img src={photo} alt={`Avatar de ${user.username}`} />
                        </figure>

                        <div className="passport-data">
                            <h1 id="passport-name" className="passport-name">
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="capital mb-3">@{user.username}</p>
                            <span className={`role-stamp role-${role}`}>{ROLE_LABELS[role] ?? role}</span>

                            <dl className="passport-fields">
                                <Info label="Nom" value={user.lastName} />
                                <Info label="Prénom" value={user.firstName} />
                                <Info label="Genre" value={GENDER_LABELS[user.gender] ?? user.gender} />
                                <Info label="Email" value={user.email} />
                                <Info label="Inscrit le" value={formatLongDate(user.createdAt)} />
                                <Info label="N° de compte" value={user.id && String(user.id).padStart(6, "0")} />
                            </dl>
                        </div>
                    </div>

                    <p className="passport-mrz" aria-hidden="true">
                        {mrz1}
                        <br />
                        {mrz2}
                    </p>
                </section>

                <div className="d-flex flex-wrap gap-3 mt-4">
                    <Button variant="primary" onClick={() => setEditing(true)}>
                        Modifier mes informations
                    </Button>
                    <Button variant="outline-primary" onClick={() => setChangingPassword(true)}>
                        Changer mon mot de passe
                    </Button>
                    <Link to={`/voyageurs/${encodeURIComponent(user.username)}`} className="align-self-center">
                        Voir ma page publique
                    </Link>
                </div>
            </Col>

            <Col lg={5}>
                <section>
                    <h2 className="profile-section">Derniers favoris</h2>
                    {favorites.length === 0 ? (
                        <p className="capital">
                            Aucune destination pour l'instant. Ajoutez-en depuis les <Link to="/destinations">destinations</Link>.
                        </p>
                    ) : (
                        <>
                            <ul className="profile-favorites">
                                {favorites.slice(0, 3).map((f) => (
                                    <li key={f.destinationId}>
                                        <div className="profile-favorite">
                                            <SafeImage src={f.image} />
                                            <span>{f.title}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/profile/favorites">Tous mes favoris ({favorites.length})</Link>
                        </>
                    )}
                </section>
            </Col>

            <ProfileEditModal show={editing} onHide={() => setEditing(false)} user={user} />
            <PasswordModal
                show={changingPassword}
                onHide={() => setChangingPassword(false)}
                onSubmit={(passwords) => dispatch(changeMyPassword(passwords)).unwrap()}
            />
        </Row>
    )
}

export default ProfilePage
