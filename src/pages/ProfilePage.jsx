import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Alert, Button, Col, Row, Spinner } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { apiRequest } from "../api/apiClient"
import { useAvatarChoice } from "../utils/avatar"
import AvatarPicker from "../components/AvatarPicker"
import { logout, selectToken, selectUser, updateAvatar } from "../features/auth/authSlice"
import { selectMessages } from "../features/contact/contactSlice"
import { useFavorites } from "../context/FavoritesContext"
import destinations from "../data/destinations"

const ROLE_LABELS = { admin: "Administrateur", moderator: "Modérateur", user: "Voyageur" }
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

// "1996-5-30" -> "30/05/1996"
function formatBirthDate(value) {
    if (!value) return null
    const [y, m, d] = value.split("-")
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`
}

// Bande de lecture d'un passeport : lettres majuscules sans accent, le reste devient "<"
function mrzText(value) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "<")
}

function mrzLines(profile) {
    const line1 = `P<ARC${mrzText(profile.lastName)}<<${mrzText(profile.firstName)}`
    const birth = (profile.birthDate ?? "").split("-").map((part) => part.padStart(2, "0"))
    const yymmdd = birth.length === 3 ? `${birth[0].slice(2)}${birth[1]}${birth[2]}` : "<<<<<<"
    const sex = profile.gender === "male" ? "M" : profile.gender === "female" ? "F" : "<"
    const line2 = `${mrzText(profile.username).padEnd(9, "<").slice(0, 9)}<ARC${yymmdd}${sex}${String(profile.id).padStart(6, "0")}`
    return [line1.padEnd(44, "<").slice(0, 44), line2.padEnd(44, "<").slice(0, 44)]
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("fr-FR")
}

function ProfilePage () {
    const token = useSelector(selectToken)
    const user = useSelector(selectUser)
    const messages = useSelector(selectMessages)
    const dispatch = useDispatch()
    const { favorites } = useFavorites()
    const [profile, setProfile] = useState(null)
    const [error, setError] = useState("")
    const [editingAvatar, setEditingAvatar] = useState(false)
    const avatarChoice = useAvatarChoice(user?.username)

    // Appel ajax pour récupérer toutes les informations de l'utilisateur connecté
    useEffect(() => {
        apiRequest("/auth/me", { token })
            .then((data) => setProfile(data))
            .catch((err) => {
                // token expiré ou invalide : on déconnecte l'utilisateur
                if (err.status === 401) dispatch(logout())
                else setError("Impossible de charger votre profil, réessayez plus tard.")
            })
    }, [token, dispatch])

    if (error) {
        return <Alert variant="danger">{error}</Alert>
    }

    if (!profile) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" role="status" />
                <p className="mt-3 capital">Chargement du profil…</p>
            </div>
        )
    }

    // L'avatar choisi sur le site passe avant l'image de l'API
    const photo = user?.image || profile.image || avatarChoice.url
    const role = profile.role ?? user?.role ?? "user"
    const favoriteDestinations = destinations.filter((d) => favorites.includes(d.slug))
    const myMessages = messages.filter((m) => m.userId === profile.id)
    const [mrz1, mrz2] = mrzLines(profile)

    const saveAvatar = () => {
        dispatch(updateAvatar(avatarChoice.url))
        setEditingAvatar(false)
    }

    return (
        <Row className="g-5">
            <Col lg={7}>
                {/* Page de données d'un passeport */}
                <section className="passport" aria-labelledby="passport-name">
                    <p className="passport-title">Passeport arco-voyage</p>

                    <div className="passport-body">
                        <figure className="passport-photo">
                            <img src={photo} alt={`Avatar de ${profile.username}`} />
                        </figure>

                        <div className="passport-data">
                            <h1 id="passport-name" className="passport-name">
                                {profile.firstName} {profile.lastName}
                            </h1>
                            <p className="capital mb-3">@{profile.username}</p>
                            <span className={`role-stamp role-${role}`}>{ROLE_LABELS[role] ?? role}</span>

                            <dl className="passport-fields">
                                <Info label="Nom" value={profile.lastName} />
                                <Info label="Prénom" value={profile.firstName} />
                                <Info label="Né(e) le" value={formatBirthDate(profile.birthDate)} />
                                <Info label="Âge" value={profile.age && `${profile.age} ans`} />
                                <Info label="Genre" value={GENDER_LABELS[profile.gender] ?? profile.gender} />
                                <Info label="Ville" value={profile.address?.city} />
                                <Info label="Pays" value={profile.address?.country} />
                                <Info label="Email" value={profile.email} />
                                <Info label="Téléphone" value={profile.phone} />
                            </dl>
                        </div>
                    </div>

                    <p className="passport-mrz" aria-hidden="true">
                        {mrz1}
                        <br />
                        {mrz2}
                    </p>
                </section>

                {/* Changer d'avatar : la bulle du menu suit */}
                {editingAvatar ? (
                    <div className="avatar-edit">
                        <AvatarPicker choice={avatarChoice} idPrefix="profile-avatar" label="Nouvel avatar" />
                        <div className="d-flex flex-wrap gap-3 mt-3">
                            <Button variant="primary" onClick={saveAvatar}>
                                Garder cet avatar
                            </Button>
                            <Button variant="link" className="px-0" onClick={() => setEditingAvatar(false)}>
                                Annuler
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button variant="link" className="px-0 mt-3" onClick={() => setEditingAvatar(true)}>
                        Changer mon avatar
                    </Button>
                )}
            </Col>

            <Col lg={5}>
                <section className="mb-5">
                    <h2 className="profile-section">Mes favoris</h2>
                    {favoriteDestinations.length === 0 ? (
                        <p className="capital">
                            Aucune destination pour l'instant. Ajoutez-en depuis les <Link to="/destinations">destinations</Link>.
                        </p>
                    ) : (
                        <>
                            <ul className="profile-favorites">
                                {favoriteDestinations.slice(0, 6).map((d) => (
                                    <li key={d.slug}>
                                        <Link to={`/destinations/${d.slug}`} className="profile-favorite">
                                            <img src={d.image} alt="" />
                                            <span>{d.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/favorites">Voir tous mes favoris ({favoriteDestinations.length})</Link>
                        </>
                    )}
                </section>

                <section>
                    <h2 className="profile-section">Mes demandes de contact</h2>
                    {myMessages.length === 0 ? (
                        <p className="capital">
                            Aucune demande envoyée. Une question ? <Link to="/contact">Écrivez-nous</Link>.
                        </p>
                    ) : (
                        <ul className="profile-messages">
                            {myMessages.map((m) => (
                                <li key={m.id}>
                                    <strong>{m.subject}</strong>
                                    <span className="capital">envoyée le {formatDate(m.sentAt)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </Col>
        </Row>
    )
}

export default ProfilePage
