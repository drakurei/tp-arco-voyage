import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiClient } from "../../api/apiClient"

// On garde le token et l'utilisateur dans le localStorage
// pour rester connecté après un rechargement de la page
export const AUTH_STORAGE_KEY = "arco_voyage_auth"

function readAuth() {
  try {
    const value = localStorage.getItem(AUTH_STORAGE_KEY)
    if (value) {
      const { token, user } = JSON.parse(value)
      return { token, user }
    }
  } catch {
    // localStorage indisponible ou valeur abîmée : personne n'est connecté
  }
  return { token: null, user: null }
}

// State initial : la session sauvegardée + le statut de la requête de connexion
const initialState = {
  ...readAuth(),
  status: "idle", // "idle" | "loading" | "failed"
  error: null,
}

// Connexion : action asynchrone (appel à l'API) créée avec createAsyncThunk
// Elle génère 3 actions : auth/login/pending, auth/login/fulfilled, auth/login/rejected
export const login = createAsyncThunk("auth/login", async ({ username, password }, { rejectWithValue }) => {
  try {
    const data = await apiClient("/auth/login", {
      method: "POST",
      body: { username, password, expiresInMins: 60 },
    })
    return {
      token: data.accessToken,
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image,
      },
    }
  } catch (error) {
    // 400 : identifiants refusés par dummyjson
    return rejectWithValue(error.status === 400 ? "Login ou mot de passe incorrect" : error.message)
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Déconnexion : on oublie le token et l'utilisateur
    logout: (state) => {
      state.token = null
      state.user = null
      state.status = "idle"
      state.error = null
    },
    // Efface le message d'erreur de connexion (quand on quitte la page)
    clearAuthError: (state) => {
      state.status = "idle"
      state.error = null
    },
  },
  // Les actions générées par createAsyncThunk se traitent dans extraReducers
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle"
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Une erreur est survenue"
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions

// Sélecteurs : pour lire le state dans les composants avec useSelector
export const selectUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token

export default authSlice.reducer
