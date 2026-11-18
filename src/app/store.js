import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import contactReducer from "../features/contact/contactSlice"

// Le store : un seul store, autant de slices que nécessaire
export const store = configureStore({
  reducer: {
    auth: authReducer,
    contact: contactReducer,
  },
})

// À chaque changement du state, on sauvegarde la session dans le localStorage
// (clés "user" et "token", relues par authSlice au démarrage)
// (les reducers doivent rester sans effet de bord, donc on le fait ici)
let previousAuth = store.getState().auth
store.subscribe(() => {
  const { auth } = store.getState()
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
