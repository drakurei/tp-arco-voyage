import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest, rejectApiError } from "../../api/apiClient"
import { normalizeDestination, normalizeRegion, toItem, toList } from "../../api/normalize"

// GET /api/regions/index.php : toutes les régions
export const fetchRegions = createAsyncThunk("destinations/fetchRegions", async (_, { rejectWithValue }) => {
  try {
    const data = await apiRequest("/api/regions/index.php")
    return toList(data).map(normalizeRegion)
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// GET /api/destinations/index.php : toutes les destinations avec leur région
export const fetchDestinations = createAsyncThunk("destinations/fetchDestinations", async (_, { rejectWithValue }) => {
  try {
    const data = await apiRequest("/api/destinations/index.php")
    return toList(data).map(normalizeDestination)
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// GET /api/destinations/show.php?slug=france : une destination
export const fetchDestination = createAsyncThunk("destinations/fetchDestination", async (slug, { rejectWithValue }) => {
  try {
    const data = await apiRequest(`/api/destinations/show.php?slug=${encodeURIComponent(slug)}`)
    return normalizeDestination(toItem(data, "destination"))
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// GET /api/destinations/by-region.php?region=asie : les destinations d'une région
export const fetchDestinationsByRegion = createAsyncThunk(
  "destinations/fetchByRegion",
  async (region, { rejectWithValue }) => {
    try {
      const data = await apiRequest(`/api/destinations/by-region.php?region=${encodeURIComponent(region)}`)
      return toList(data).map(normalizeDestination)
    } catch (error) {
      return rejectApiError(error, rejectWithValue)
    }
  }
)

// POST /api/destinations/store.php : créer une destination (admin)
// destination : { slug, name, region_id, capital, description, image, lat, long }
export const createDestination = createAsyncThunk(
  "destinations/createDestination",
  async (destination, { getState, dispatch, rejectWithValue }) => {
    try {
      const data = await apiRequest("/api/destinations/store.php", {
        method: "POST",
        token: getState().auth.token,
        body: JSON.stringify(destination),
      })
      // on recharge la liste pour avoir la destination complète (id, région, créateur)
      dispatch(fetchDestinations())
      return data
    } catch (error) {
      return rejectApiError(error, rejectWithValue)
    }
  }
)

// POST /api/destinations/delete.php : supprimer une destination
// seul l'admin qui l'a créée peut la supprimer (vérifié aussi par le serveur)
export const deleteDestination = createAsyncThunk(
  "destinations/deleteDestination",
  async (id, { getState, rejectWithValue }) => {
    try {
      await apiRequest("/api/destinations/delete.php", {
        method: "POST",
        token: getState().auth.token,
        body: JSON.stringify({ id }),
      })
      return id
    } catch (error) {
      return rejectApiError(error, rejectWithValue)
    }
  }
)

const initialState = {
  // toutes les destinations
  list: [],
  listStatus: "idle",
  listError: null,

  // régions (menus déroulants, liens)
  regions: [],
  regionsStatus: "idle",

  // destination affichée sur la page détails
  current: null,
  currentStatus: "idle",
  currentError: null,

  // destinations d'une région : { slug, items }
  byRegion: { slug: null, items: [] },
  byRegionStatus: "idle",
  byRegionError: null,
}

const destinationsSlice = createSlice({
  name: "destinations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // régions
      .addCase(fetchRegions.pending, (state) => {
        state.regionsStatus = "loading"
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.regionsStatus = "succeeded"
        state.regions = action.payload
      })
      .addCase(fetchRegions.rejected, (state) => {
        state.regionsStatus = "failed"
      })

      // liste
      .addCase(fetchDestinations.pending, (state) => {
        state.listStatus = "loading"
        state.listError = null
      })
      .addCase(fetchDestinations.fulfilled, (state, action) => {
        state.listStatus = "succeeded"
        state.list = action.payload
      })
      .addCase(fetchDestinations.rejected, (state, action) => {
        state.listStatus = "failed"
        state.listError = action.payload ?? "Impossible de charger les destinations"
      })

      // détails
      .addCase(fetchDestination.pending, (state) => {
        state.currentStatus = "loading"
        state.currentError = null
      })
      .addCase(fetchDestination.fulfilled, (state, action) => {
        state.currentStatus = "succeeded"
        state.current = action.payload
      })
      .addCase(fetchDestination.rejected, (state, action) => {
        state.currentStatus = "failed"
        state.current = null
        state.currentError = action.payload ?? "Destination introuvable"
      })

      // par région
      .addCase(fetchDestinationsByRegion.pending, (state, action) => {
        state.byRegionStatus = "loading"
        state.byRegionError = null
        state.byRegion = { slug: action.meta.arg, items: [] }
      })
      .addCase(fetchDestinationsByRegion.fulfilled, (state, action) => {
        state.byRegionStatus = "succeeded"
        state.byRegion = { slug: action.meta.arg, items: action.payload }
      })
      .addCase(fetchDestinationsByRegion.rejected, (state, action) => {
        state.byRegionStatus = "failed"
        state.byRegionError = action.payload ?? "Région introuvable"
      })

      // suppression : on retire la destination partout
      .addCase(deleteDestination.fulfilled, (state, action) => {
        state.list = state.list.filter((d) => d.id !== action.payload)
        state.byRegion.items = state.byRegion.items.filter((d) => d.id !== action.payload)
        if (state.current?.id === action.payload) state.current = null
      })
  },
})

export const selectDestinations = (state) => state.destinations.list
export const selectRegions = (state) => state.destinations.regions

export default destinationsSlice.reducer
