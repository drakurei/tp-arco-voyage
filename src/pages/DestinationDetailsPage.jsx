import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice";
import { fetchDestination } from "../features/destinations/destinationsSlice";
import { addFavorite, removeFavorite, selectIsFavorite } from "../features/favorites/favoritesSlice";
import NotFoundPage from "./NotFoundPage";
import CommentsSection from "../components/CommentsSection";
import ConfirmModal from "../components/ConfirmModal";
import SafeImage from "../components/SafeImage";
import { ErrorNote, LoadingLines } from "../components/PageStatus";
import { findExtras } from "../utils/destinationExtras";

// Leaflet est lourd : la carte est chargée à part, seulement sur cette page
const DestinationMap = lazy(() => import("../components/DestinationMap"));

// Petit cœur, plein si la destination est en favori
function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}

function DestinationDetailsPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { current, currentStatus, currentError } = useSelector((state) => state.destinations);
  // la destination affichée est-elle celle de l'URL ? (évite d'afficher l'ancienne pendant le chargement)
  const destination = current?.slug === slug ? current : null;
  const isFavorite = useSelector(selectIsFavorite(destination?.id));

  // fenêtre de confirmation du favori : "add", "remove" ou null
  const [favoriteAction, setFavoriteAction] = useState(null);
  const [favoritePending, setFavoritePending] = useState(false);
  const [favoriteError, setFavoriteError] = useState(null);

  useEffect(() => {
    dispatch(fetchDestination(slug));
  }, [slug, dispatch]);

  if (!destination) {
    if (currentStatus === "failed") {
      // 404 : le slug n'existe pas ; autre erreur : on propose de réessayer
      return /introuvable|not found/i.test(currentError ?? "") ? (
        <NotFoundPage />
      ) : (
        <ErrorNote message={currentError} onRetry={() => dispatch(fetchDestination(slug))} />
      );
    }
    return <LoadingLines lines={5} label="Chargement de la destination…" />;
  }

  // texte détaillé et galerie : seulement pour les pays de notre fichier de données
  const extras = findExtras(destination);

  const confirmFavorite = async () => {
    setFavoritePending(true);
    setFavoriteError(null);
    try {
      if (favoriteAction === "add") await dispatch(addFavorite(destination)).unwrap();
      else await dispatch(removeFavorite(destination.id)).unwrap();
      setFavoriteAction(null);
    } catch (message) {
      setFavoriteError(String(message));
    } finally {
      setFavoritePending(false);
    }
  };

  return (
    <>
      <Row className="g-5 align-items-center">
        <Col lg={7}>
          <figure className="print detail-print">
            <SafeImage src={destination.image} alt={destination.name} label={destination.name} className="detail-image" />
          </figure>
        </Col>
        <Col lg={5}>
          {destination.regionName && <p className="eyebrow">{destination.regionName}</p>}
          <h1 className="mb-4">{destination.name}</h1>

          <dl className="detail-infos">
            <div>
              <dt>Capitale</dt>
              <dd>{destination.capital}</dd>
            </div>
            {destination.regionName && (
              <div>
                <dt>Région</dt>
                <dd>
                  {destination.regionSlug ? (
                    <Link to={`/region/${destination.regionSlug}`}>{destination.regionName}</Link>
                  ) : (
                    destination.regionName
                  )}
                </dd>
              </div>
            )}
          </dl>

          <p className="lead-text">{destination.description}</p>

          {/* Favoris : le bouton ne fonctionne que si l'utilisateur est connecté */}
          <div className="favorite-box">
            {!user ? (
              <>
                <Button variant="outline-primary" className="favorite-btn" disabled>
                  <HeartIcon filled={false} />
                  Ajouter aux favoris
                </Button>
                <p className="favorite-hint">
                  <Link to="/login">Connectez-vous</Link> pour ajouter cette destination à vos favoris.
                </p>
              </>
            ) : isFavorite ? (
              <>
                <Button variant="primary" className="favorite-btn" onClick={() => setFavoriteAction("remove")}>
                  <HeartIcon filled />
                  Retirer des favoris
                </Button>
                <p className="favorite-hint">
                  Cette destination est dans vos <Link to="/profile/favorites">favoris</Link>.
                </p>
              </>
            ) : (
              <Button variant="outline-primary" className="favorite-btn" onClick={() => setFavoriteAction("add")}>
                <HeartIcon filled={false} />
                Ajouter aux favoris
              </Button>
            )}
          </div>

          <Button as={Link} to="/destinations" variant="link" className="mt-3 px-0">
            Retour aux destinations
          </Button>
        </Col>
      </Row>

      <Row className="g-5 mt-2">
        <Col lg={7}>
          {extras?.details && (
            <>
              <h2 className="mb-3">Découvrir le pays</h2>
              <p className="detail-text mb-5">{extras.details}</p>
            </>
          )}

          {extras?.gallery?.length > 0 && (
            <div className="mb-5">
              <h2 className="mb-3">En images</h2>
              <Row xs={3} className="g-2 g-md-3">
                {extras.gallery.map((photo) => (
                  <Col key={photo.src}>
                    <figure className="gallery-item">
                      <img src={photo.src} alt={photo.alt} loading="lazy" />
                      <figcaption>{photo.alt}</figcaption>
                    </figure>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          <CommentsSection destination={destination} />
        </Col>

        <Col lg={5}>
          <h2 className="mb-3">Sur la carte</h2>
          <Suspense fallback={<LoadingLines lines={2} label="Chargement de la carte…" />}>
            <DestinationMap lat={destination.lat} long={destination.long} name={destination.name} />
          </Suspense>
        </Col>
      </Row>

      <ConfirmModal
        show={!!favoriteAction}
        title={favoriteAction === "add" ? "Ajouter aux favoris ?" : "Retirer des favoris ?"}
        confirmLabel={favoriteAction === "add" ? "Ajouter" : "Retirer"}
        danger={favoriteAction === "remove"}
        pending={favoritePending}
        error={favoriteError}
        onConfirm={confirmFavorite}
        onHide={() => {
          setFavoriteAction(null);
          setFavoriteError(null);
        }}
      >
        <p className="mb-0">
          {favoriteAction === "add" ? (
            <>
              <strong>{destination.name}</strong> rejoindra la liste de vos favoris, visible depuis votre profil.
            </>
          ) : (
            <>
              <strong>{destination.name}</strong> ne sera plus dans vos favoris.
            </>
          )}
        </p>
      </ConfirmModal>
    </>
  );
}

export default DestinationDetailsPage;
