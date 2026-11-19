import { useState } from "react"
import { Link } from "react-router-dom"
import { Button, Card } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { selectUser } from "../features/auth/authSlice"
import { addFavorite, removeFavorite, selectIsFavorite } from "../features/favorites/favoritesSlice"
import SafeImage from "./SafeImage"
import { RatingPunch } from "./Rating"

// Un tirage photo scotché sur la page : utilisé par Destinations, Région et Recherche
// showRegion : afficher la région (inutile sur la page d'une région)
// showText   : afficher la description
function DestinationCard({ destination, showRegion = true, showText = true }) {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const isFavorite = useSelector(selectIsFavorite(destination.id))
  // note moyenne calculée à partir des commentaires (commentsSlice)
  const rating = useSelector((state) => state.comments.ratings[destination.id])
  const [pending, setPending] = useState(false)

  // Ajout / retrait direct depuis la liste (l'action se défait d'un clic)
  const toggleFavorite = async () => {
    setPending(true)
    try {
      if (isFavorite) await dispatch(removeFavorite(destination.id)).unwrap()
      else await dispatch(addFavorite(destination)).unwrap()
    } catch {
      // en cas d'échec le cœur reste dans son état précédent
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="destination-card h-100">
      <div className="card-photo">
        <SafeImage src={destination.image} alt={destination.name} label={destination.name} className="card-img-top" loading="lazy" />
        {user && (
          <button
            type="button"
            className={isFavorite ? "card-heart is-on" : "card-heart"}
            onClick={toggleFavorite}
            disabled={pending}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Retirer ${destination.name} des favoris` : `Ajouter ${destination.name} aux favoris`}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
            </svg>
          </button>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        {showRegion && destination.regionName && <p className="eyebrow mb-1">{destination.regionName}</p>}
        <Card.Title as="h2">{destination.name}</Card.Title>
        <p className="capital mb-2">Capitale : {destination.capital}</p>
        {rating?.count > 0 && (
          <p className="card-rating">
            <RatingPunch value={Math.round(rating.average)} />
            <span>
              {rating.average.toFixed(1).replace(".", ",")}/5 sur {rating.count} avis
            </span>
          </p>
        )}
        {showText && <Card.Text>{destination.description}</Card.Text>}
        <Button
          as={Link}
          to={`/destinations/${destination.slug}`}
          variant="outline-primary"
          className="mt-auto align-self-start"
        >
          Voir les détails
        </Button>
      </Card.Body>
    </Card>
  )
}

export default DestinationCard
