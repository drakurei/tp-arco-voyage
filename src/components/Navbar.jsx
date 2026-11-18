import { startTransition, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../features/auth/authSlice";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === "dark";
  const loggingOut = useRef(false);

  // Déconnexion en deux temps :
  // 1. on va sur l'accueil (React Router navigue dans une transition)
  // 2. une fois l'accueil affiché, on vide la session dans le store
  // Si on vidait le store tout de suite, la page profil (protégée)
  // nous renverrait vers /login avant d'arriver sur l'accueil
  const handleLogout = () => {
    // déjà sur l'accueil : rien à attendre, on déconnecte tout de suite
    if (location.pathname === "/") {
      dispatch(logout());
      return;
    }
    loggingOut.current = true;
    startTransition(() => navigate("/"));
  };

  // L'adresse a changé : si une déconnexion est en attente, on la fait maintenant
  useEffect(() => {
    if (loggingOut.current && location.pathname === "/") {
      loggingOut.current = false;
      dispatch(logout());
    }
  }, [location.pathname, dispatch]);

  return (
    // La couverture du carnet : les liens sont des onglets d'intercalaires
    <header className="site-header">
      <Link to="/" className="brand">
        arco-voyage
      </Link>

      <nav className="main-nav" aria-label="Navigation principale">
        <div className="nav-tabs-row">
          <NavLink to="/" end>
            Accueil
          </NavLink>
          <NavLink to="/destinations">Destinations</NavLink>
          <NavLink to="/about">À propos</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>
      </nav>

      <div className="header-actions">
        {/* Choix du thème clair / sombre */}
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
          title={isDark ? "Thème clair" : "Thème sombre"}
        >
          {isDark ? (
            // soleil
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            // lune
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          )}
        </button>

        {user ? (
          <>
            <NavLink to="/favorites" className="account-link account-secondary">
              Favoris
            </NavLink>
            <NavLink to="/profile" className="account-link">
              Profil
            </NavLink>
            <button type="button" className="account-link account-secondary" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <NavLink to="/register" className="account-link account-secondary">
              Inscription
            </NavLink>
            <NavLink to="/login" className="account-link">
              Connexion
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
