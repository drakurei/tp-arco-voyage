import Router from "./router/Router";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      {/* L'utilisateur connecté est dans le store Redux (features/auth) */}
      <FavoritesProvider>
        <Router />
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;
