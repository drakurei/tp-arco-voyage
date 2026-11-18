import { Link } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import Stamp from "../components/Stamp";

function HomePage() {
  return (
    <Row className="home-spread align-items-center g-5">
      <Col lg={6}>
        <p className="note note-red">Carnet n°1, ouvert le 18 novembre</p>
        <h1 className="hero-title mb-4">Neuf pays, un seul carnet.</h1>
        <p className="lead-text">
          Des temples de Kyoto aux lagons des Maldives, chaque page raconte une
          destination : sa région, sa capitale et les photos rapportées du
          voyage.
        </p>
        <Button as={Link} to="/destinations" variant="primary" size="lg" className="mt-3">
          Ouvrir le carnet
        </Button>
      </Col>
      <Col lg={6}>
        <div className="hero-collage">
          <figure className="print print-hero">
            <img
              src="https://cdn.pixabay.com/photo/2020/01/31/20/03/japan-4808857_1280.jpg"
              alt="Rue de Tokyo à la tombée de la nuit, enseignes allumées"
            />
            <figcaption className="note">Tokyo, à la tombée de la nuit</figcaption>
          </figure>
          <Stamp className="stamp-hero" />
        </div>
      </Col>
    </Row>
  );
}

export default HomePage;
