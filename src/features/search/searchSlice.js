import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest, rejectApiError } from "../../api/apiClient"
import { normalizeDestination, toList } from "../../api/normalize"

// GET /api/destinations/search.php
//   ?keyword=japon              : cherche dans le nom, la capitale, le nom et le slug de la région
//   ?region=asie                : toutes les destinations de la région
//   ?keyword=tokyo&region=asie  : le mot-clé, uniquement dans cette région
// criteria : { keyword, region }
export const searchDestinations = createAsyncThunk(
  "search/searchDestinations",
  async ({ keyword = "", region = "" }, { rejectWithValue }) => {
    const params = new URLSearchParams()
    if (keyword.trim()) params.set("keyword", keyword.trim())
    if (region) params.set("region", region)

    // sans critère l'API répond 400 : on ne lance pas la requête
    if (!params.toString()) return rejectWithValue("Saisissez un mot-clé ou choisissez une région")

    try {
      const data = await apiRequest(`/api/destinations/search.php?${params}`)
      return toList(data).map(normalizeDestination)
    } catch (error) {
      // 404 : certaines API répondent ainsi quand rien ne correspond
      if (error.status === 404) return []
      return rejectApiError(error, rejectWithValue)
    }
  }
)

const initialState = {
  // derniers critères envoyés
  keyword: "",
  region: "",
  results: [],
  status: "idle",
  error: null,
}

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearch: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchDestinations.pending, (state, action) => {
        state.status = "loading"
        state.error = null
        state.keyword = action.meta.arg.keyword ?? ""
        state.region = action.meta.arg.region ?? ""
      })
      .addCase(searchDestinations.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.results = action.payload
      })
      .addCase(searchDestinations.rejected, (state, action) => {
        state.status = "failed"
        state.results = []
        state.error = action.payload ?? "La recherche a échoué"
      })
  },
})

export const { clearSearch } = searchSlice.actions

export default searchSlice.reducer
