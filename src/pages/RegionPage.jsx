import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchDestinationsByRegion, fetchRegions, selectRegions } from "../features/destinations/destinationsSlice";
import DestinationCard from "../components/DestinationCard";
import { ErrorNote, LoadingLines } from "../components/PageStatus";
import { plural } from "../utils/format";
import { useRatings } from "../features/comments/useRatings";

function RegionPage() {
  // Le slug de la région est passé dans l'URL : /region/asie
  const { region } = useParams();
  const dispatch = useDispatch();
  const regions = useSelector(selectRegions);
  const { byRegion, byRegionStatus, byRegionError, regionsStatus } = useSelector((state) => state.destinations);

  useEffect(() => {
    dispatch(fetchDestinationsByRegion(region));
  }, [region, dispatch]);

  // les régions servent à afficher le vrai nom ("Amérique du Sud" plutôt que le slug)
  useEffect(() => {
    if (regionsStatus === "idle") dispatch(fetchRegions());
  }, [regionsStatus, dispatch]);

  const regionName = regions.find((r) => r.slug === region)?.name ?? byRegion.items[0]?.regionName ?? region;
  const items = byRegion.slug === region ? byRegion.items : [];
  useRatings(items);

  if (byRegionStatus === "failed" && /introuvable|not found/i.test(byRegionError ?? "")) {
    return (
      <div className="text-page">
        <h1 className="mb-4">Région introuvable</h1>
        <p>Aucune région ne correspond à « {region} ».</p>
        <Button as={Link} to="/destinations" variant="primary" className="mt-3">
          Voir toutes les destinations
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="eyebrow">Région</p>
      <h1 className="mb-2">{regionName}</h1>
      {byRegionStatus === "succeeded" && <p className="capital mb-4">{plural(items.length, "destination")}</p>}

      {byRegionStatus === "loading" && <LoadingLines lines={3} />}
      {byRegionStatus === "failed" && (
        <ErrorNote message={byRegionError} onRetry={() => dispatch(fetchDestinationsByRegion(region))} />
      )}
      {byRegionStatus === "succeeded" && items.length === 0 && (
        <p className="text-page">
          Pas encore de destination dans cette région. <Link to="/destinations">Voir toutes les destinations</Link>
        </p>
      )}

      <Row xs={1} md={2} lg={3} className="g-4">
        {items.map((destination) => (
          <Col key={destination.id}>
            <DestinationCard destination={destination} showRegion={false} />
          </Col>
        ))}
      </Row>
    </>
  );
}

export default RegionPage;
