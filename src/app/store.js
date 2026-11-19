import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import contactReducer from "../features/contact/contactSlice"
import destinationsReducer from "../features/destinations/destinationsSlice"
import commentsReducer from "../features/comments/commentsSlice"
import favoritesReducer from "../features/favorites/favoritesSlice"
import usersReducer from "../features/users/usersSlice"
import searchReducer from "../features/search/searchSlice"
import themeReducer, { THEME_KEY } from "../features/theme/themeSlice"

// Le store : un seul store, autant de slices que nécessaire
export const store = configureStore({
  reducer: {
    auth: authReducer,
    contact: contactReducer,
    destinations: destinationsReducer,
    comments: commentsReducer,
    favorites: favoritesReducer,
    users: usersReducer,
    search: searchReducer,
    theme: themeReducer,
  },
})

// À chaque changement du state, on sauvegarde ce qui doit survivre à un rechargement
// - la session : clés "user" et "token" (relues par authSlice au démarrage)
// - le thème : clé "arco_voyage_theme" (relue par themeSlice)
// (les reducers doivent rester sans effet de bord, donc on le fait ici)
let previousAuth = store.getState().auth
let previousTheme = store.getState().theme.mode

store.subscribe(() => {
  const { auth, theme } = store.getState()

  if (theme.mode !== previousTheme) {
    previousTheme = theme.mode
    try {
      localStorage.setItem(THEME_KEY, theme.mode)
    } catch {
      // localStorage indisponible
    }
  }

  if (auth.token === previousAuth.token && auth.user === previousAuth.user) return
  previousAuth = auth

  try {
    if (auth.token) {
      localStorage.setItem("user", JSON.stringify(auth.user))
      localStorage.setItem("token", auth.token)
    } else {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    }
  } catch {
    // localStorage indisponible : on garde seulement l'état en mémoire
  }
})
