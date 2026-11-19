import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDestinations,
  fetchRegions,
  selectDestinations,
  selectRegions,
} from "../features/destinations/destinationsSlice";
import DestinationCard from "../components/DestinationCard";
import { ErrorNote, LoadingLines } from "../components/PageStatus";
import { useRatings } from "../features/comments/useRatings";

// La carte (Leaflet) n'est téléchargée que si on choisit la vue "Carte"
const WorldMap = lazy(() => import("../components/WorldMap"));

function DestinationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const destinations = useSelector(selectDestinations);
  const regions = useSelector(selectRegions);
  const { listStatus, listError, regionsStatus } = useSelector((state) => state.destinations);
  const [query, setQuery] = useState("");
  // vue choisie : les tirages photo ou la carte du monde
  const [view, setView] = useState("photos");

  // note moyenne affichée sur chaque carte
  useRatings(destinations);

  // Récupération des destinations et des régions (une seule fois)
  useEffect(() => {
    if (listStatus === "idle") dispatch(fetchDestinations());
    if (regionsStatus === "idle") dispatch(fetchRegions());
  }, [listStatus, regionsStatus, dispatch]);

  // Recherche rapide : on ouvre la page Recherche avec le mot-clé dans l'URL
  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = query.trim();
    navigate(keyword ? `/search?keyword=${encodeURIComponent(keyword)}` : "/search");
  };

  return (
    <>
      <div className="page-head mb-3">
        <h1 className="mb-0">Destinations</h1>

        <form className="quick-search" role="search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Pays, capitale, région…"
            aria-label="Rechercher une destination"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" aria-label="Lancer la recherche">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </button>
        </form>
      </div>

      {/* Raccourcis vers chaque région : des étiquettes collées en haut de page */}
      {regions.length > 0 && (
        <nav className="region-labels mb-5" aria-label="Destinations par région">
          {regions.map((region) => (
            <Link key={region.slug} to={`/region/${region.slug}`}>
              {region.name}
            </Link>
          ))}
        </nav>
      )}

      {destinations.length > 0 && (
        <div className="view-switch mb-4" role="group" aria-label="Affichage">
          <button type="button" aria-pressed={view === "photos"} onClick={() => setView("photos")}>
            Photos
          </button>
          <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>
            Carte
          </button>
        </div>
      )}

      {listStatus === "loading" && <LoadingLines lines={4} label="Chargement des destinations…" />}
      {listStatus === "failed" && <ErrorNote message={listError} onRetry={() => dispatch(fetchDestinations())} />}
      {listStatus === "succeeded" && destinations.length === 0 && (
        <p className="text-page">Le carnet est encore vide : aucune destination n'a été publiée.</p>
      )}

      {view === "map" ? (
        <Suspense fallback={<LoadingLines lines={3} label="Chargement de la carte…" />}>
          <WorldMap destinations={destinations} />
        </Suspense>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {destinations.map((destination) => (
            <Col key={destination.id}>
              <DestinationCard destination={destination} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}

export default DestinationsPage;
