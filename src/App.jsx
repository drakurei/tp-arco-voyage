import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Router from "./router/Router";
import { selectTheme } from "./features/theme/themeSlice";
import { selectToken, sessionExpired, tokenExpiresAt } from "./features/auth/authSlice";
import { fetchFavorites } from "./features/favorites/favoritesSlice";

function App() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const token = useSelector(selectToken);

  // On applique le thème sur <html> : notre CSS (data-theme) et Bootstrap (data-bs-theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.bsTheme = theme;
  }, [theme]);

  // Connecté : on charge ses favoris une fois (bouton de la page détails, profil)
  useEffect(() => {
    if (token) dispatch(fetchFavorites());
  }, [token, dispatch]);

  // Le token a une date d'expiration : on déconnecte l'utilisateur à ce moment-là
  useEffect(() => {
    const expiresAt = tokenExpiresAt(token);
    if (!expiresAt) return;
    const delay = expiresAt - Date.now();
    // setTimeout n'accepte pas plus de ~24 jours : au-delà, on ne programme rien
    if (delay > 2_147_000_000) return;
    const timer = setTimeout(() => dispatch(sessionExpired()), Math.max(delay, 0));
    return () => clearTimeout(timer);
  }, [token, dispatch]);

  return <Router />;
}

export default App;
