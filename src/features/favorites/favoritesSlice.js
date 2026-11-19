import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest, rejectApiError } from "../../api/apiClient"
import { normalizeFavorite, toList } from "../../api/normalize"
import { logout, sessionExpired } from "../auth/authSlice"

// GET /api/favorites/index.php : favoris de l'utilisateur connecté
export const fetchFavorites = createAsyncThunk("favorites/fetch", async (_, { getState, rejectWithValue }) => {
  try {
    const data = await apiRequest("/api/favorites/index.php", { token: getState().auth.token })
    return toList(data).map(normalizeFavorite)
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// POST /api/favorites/store.php : ajouter une destination
// destination : la destination affichée ({ id, name, image })
export const addFavorite = createAsyncThunk("favorites/add", async (destination, { getState, rejectWithValue }) => {
  try {
    await apiRequest("/api/favorites/store.php", {
      method: "POST",
      token: getState().auth.token,
      body: JSON.stringify({ destinationId: destination.id, title: destination.name, image: destination.image }),
    })
    return {
      id: null,
      destinationId: destination.id,
      title: destination.name,
      image: destination.image,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// POST /api/favorites/delete.php : retirer une destination de ses favoris
export const removeFavorite = createAsyncThunk(
  "favorites/remove",
  async (destinationId, { getState, rejectWithValue }) => {
    try {
      await apiRequest("/api/favorites/delete.php", {
        method: "POST",
        token: getState().auth.token,
        body: JSON.stringify({ destinationId }),
      })
      return destinationId
    } catch (error) {
      return rejectApiError(error, rejectWithValue)
    }
  }
)

const initialState = {
  list: [],
  status: "idle",
  error: null,
}

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.list = action.payload
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Impossible de charger vos favoris"
      })

      // pas de doublon : l'API refuse déjà, on vérifie aussi côté site
      .addCase(addFavorite.fulfilled, (state, action) => {
        if (!state.list.some((f) => f.destinationId === action.payload.destinationId)) {
          state.list.unshift(action.payload)
        }
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.list = state.list.filter((f) => f.destinationId !== action.payload)
      })

      // déconnexion : les favoris appartiennent au compte, on les oublie
      .addCase(logout, () => initialState)
      .addCase(sessionExpired, () => initialState)
  },
})

export const selectFavorites = (state) => state.favorites.list
export const selectIsFavorite = (destinationId) => (state) =>
  state.favorites.list.some((f) => f.destinationId === destinationId)

export default favoritesSlice.reducer
