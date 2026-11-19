import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { fetchFavorites, removeFavorite, selectFavorites } from "../features/favorites/favoritesSlice"
import { fetchDestinations, selectDestinations } from "../features/destinations/destinationsSlice"
import { ErrorNote, LoadingLines } from "../components/PageStatus"
import ConfirmModal from "../components/ConfirmModal"
import SafeImage from "../components/SafeImage"
import { formatDay, plural } from "../utils/format"

// Sous-page du profil : toutes les destinations mises en favoris
function ProfileFavoritesPage() {
  const dispatch = useDispatch()
  const favorites = useSelector(selectFavorites)
  const { status, error } = useSelector((state) => state.favorites)
  const destinations = useSelector(selectDestinations)
  const listStatus = useSelector((state) => state.destinations.listStatus)
  // favori en cours de retrait (fenêtre de confirmation)
  const [toRemove, setToRemove] = useState(null)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState(null)

  // l'API des favoris ne donne que l'id : on a besoin de la liste pour retrouver le slug (lien)
  useEffect(() => {
    if (listStatus === "idle") dispatch(fetchDestinations())
  }, [listStatus, dispatch])

  const slugOf = (destinationId) => destinations.find((d) => d.id === destinationId)?.slug

  const confirmRemove = async () => {
    setRemoving(true)
    setRemoveError(null)
    try {
      await dispatch(removeFavorite(toRemove.destinationId)).unwrap()
      setToRemove(null)
    } catch (message) {
      setRemoveError(String(message))
    } finally {
      setRemoving(false)
    }
  }

  return (
    <>
      <h1 className="mb-2">Mes favoris</h1>
      <p className="capital mb-4">{plural(favorites.length, "destination")} à revoir un jour.</p>

      {status === "loading" && favorites.length === 0 && <LoadingLines />}
      {status === "failed" && <ErrorNote message={error} onRetry={() => dispatch(fetchFavorites())} />}

      {status !== "loading" && favorites.length === 0 && status !== "failed" && (
        <div className="text-page">
          <p>
            Pas encore de favori. Sur la fiche d'une destination, le bouton « Ajouter aux favoris » la range ici.
          </p>
          <Button as={Link} to="/destinations" variant="primary" className="mt-2">
            Parcourir les destinations
          </Button>
        </div>
      )}

      <ul className="favorite-board">
        {favorites.map((favorite) => {
          const slug = slugOf(favorite.destinationId)
          return (
            <li key={favorite.destinationId}>
              <figure className="print favorite-print">
                <SafeImage src={favorite.image} label={favorite.title} loading="lazy" />
                <figcaption>
                  <strong>{favorite.title}</strong>
                  {favorite.createdAt && <span className="capital">ajouté le {formatDay(favorite.createdAt)}</span>}
                </figcaption>
              </figure>
              <div className="favorite-actions">
                {slug && <Link to={`/destinations/${slug}`}>Voir la fiche</Link>}
                <Button variant="link" className="p-0" onClick={() => setToRemove(favorite)}>
                  Retirer
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      <ConfirmModal
        show={!!toRemove}
        title="Retirer ce favori ?"
        confirmLabel="Retirer"
        danger
        pending={removing}
        error={removeError}
        onConfirm={confirmRemove}
        onHide={() => {
          setToRemove(null)
          setRemoveError(null)
        }}
      >
        <p className="mb-0">
          <strong>{toRemove?.title}</strong> ne sera plus dans vos favoris. Vous pourrez l'ajouter à nouveau depuis sa fiche.
        </p>
      </ConfirmModal>
    </>
  )
}

export default ProfileFavoritesPage
