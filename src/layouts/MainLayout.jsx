import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import Navbar from "../components/Navbar";
import { LoadingLines } from "../components/PageStatus";

function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="py-5">
        <Container>
          {/* les pages chargées à la demande affichent des lignes grisées le temps d'arriver */}
          <Suspense fallback={<LoadingLines lines={4} />}>
            <Outlet />
          </Suspense>
        </Container>
      </main>
      <footer className="site-footer">
        <Container>Carnet tenu par Jonathan Davy</Container>
      </footer>
    </>
  );
}

export default MainLayout;
