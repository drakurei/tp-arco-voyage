import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest, rejectApiError } from "../../api/apiClient"
import { normalizeComment, normalizeDestination, toList } from "../../api/normalize"

// GET /api/comments/by-destination.php?destination_id=1 : commentaires d'une destination
export const fetchCommentsByDestination = createAsyncThunk(
  "comments/fetchByDestination",
  async (destinationId, { rejectWithValue }) => {
    try {
      const data = await apiRequest(`/api/comments/by-destination.php?destination_id=${destinationId}`)
      return toList(data).map(normalizeComment)
    } catch (error) {
      return rejectApiError(error, rejectWithValue)
    }
  }
)

// GET /api/comments/by-user.php : commentaires de l'utilisateur connecté
export const fetchMyComments = createAsyncThunk("comments/fetchMine", async (_, { getState, rejectWithValue }) => {
  try {
    const data = await apiRequest("/api/comments/by-user.php", { token: getState().auth.token })
    return toList(data).map(normalizeComment)
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// Administration : l'API n'a pas de route "tous les commentaires",
// on récupère les destinations puis les commentaires de chacune
export const fetchAllComments = createAsyncThunk("comments/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const destinations = toList(await apiRequest("/api/destinations/index.php")).map(normalizeDestination)
    const lists = await Promise.all(
      destinations.map(async (destination) => {
        const data = await apiRequest(`/api/comments/by-destination.php?destination_id=${destination.id}`)
        // on complète chaque commentaire avec le nom de sa destination
        return toList(data).map((raw) => ({
          ...normalizeComment(raw),
          destinationId: destination.id,
          destinationName: destination.name,
          destinationSlug: destination.slug,
        }))
      })
    )
    return lists.flat().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// Note moyenne de chaque destination, calculée à partir de ses commentaires
// (l'API ne fournit pas de moyenne) : { [destinationId]: { average, count } }
// destinationIds : les destinations affichées
export const fetchRatings = createAsyncThunk("comments/fetchRatings", async (destinationIds, { rejectWithValue }) => {
  try {
    const entries = await Promise.all(
      destinationIds.map(async (id) => {
        const comments = toList(await apiRequest(`/api/comments/by-destination.php?destination_id=${id}`))
        return [id, summarize(comments.map(normalizeComment))]
      })
    )
    return Object.fromEntries(entries)
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// { average: 4.5, count: 2 } : seules les notes renseignées comptent (la note est facultative)
function summarize(comments) {
  const ratings = comments.map((c) => c.rating).filter((r) => r >= 1 && r <= 5)
  const average = ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null
  return { average, count: ratings.length }
}

// POST /api/comments/store.php : publier un commentaire (connecté)
// comment : { destination_id, content, rating }  (user_id est lu dans le token par le serveur)
export const addComment = createAsyncThunk("comments/add", async (comment, { getState, dispatch, rejectWithValue }) => {
  try {
    const data = await apiRequest("/api/comments/store.php", {
      method: "POST",
      token: getState().auth.token,
      body: JSON.stringify(comment),
    })
    // on recharge les commentaires de la destination pour avoir le nouveau avec son auteur
    dispatch(fetchCommentsByDestination(comment.destination_id))
    return data
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// POST /api/comments/delete.php : supprimer un commentaire (admin)
export const deleteComment = createAsyncThunk("comments/delete", async (id, { getState, rejectWithValue }) => {
  try {
    await apiRequest("/api/comments/delete.php", {
      method: "POST",
      token: getState().auth.token,
      body: JSON.stringify({ id }),
    })
    return id
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

const initialState = {
  // commentaires de la destination affichée
  byDestination: { destinationId: null, items: [] },
  byDestinationStatus: "idle",

  // commentaires de l'utilisateur connecté (profil)
  mine: [],
  mineStatus: "idle",

  // note moyenne par destination (cartes de la liste)
  ratings: {},

  // tous les commentaires (administration)
  all: [],
  allStatus: "idle",
  allError: null,
}

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsByDestination.pending, (state, action) => {
        state.byDestinationStatus = "loading"
        // une autre destination : on vide l'ancienne liste
        if (state.byDestination.destinationId !== action.meta.arg) {
          state.byDestination = { destinationId: action.meta.arg, items: [] }
        }
      })
      .addCase(fetchCommentsByDestination.fulfilled, (state, action) => {
        state.byDestinationStatus = "succeeded"
        // le plus récent en premier
        const items = [...action.payload].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        state.byDestination = { destinationId: action.meta.arg, items }
        // on en profite pour tenir la note moyenne à jour
        state.ratings[action.meta.arg] = summarize(items)
      })
      .addCase(fetchCommentsByDestination.rejected, (state) => {
        state.byDestinationStatus = "failed"
      })

      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.ratings = { ...state.ratings, ...action.payload }
      })

      .addCase(fetchMyComments.pending, (state) => {
        state.mineStatus = "loading"
      })
      .addCase(fetchMyComments.fulfilled, (state, action) => {
        state.mineStatus = "succeeded"
        state.mine = [...action.payload].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      })
      .addCase(fetchMyComments.rejected, (state) => {
        state.mineStatus = "failed"
      })

      .addCase(fetchAllComments.pending, (state) => {
        state.allStatus = "loading"
        state.allError = null
      })
      .addCase(fetchAllComments.fulfilled, (state, action) => {
        state.allStatus = "succeeded"
        state.all = action.payload
      })
      .addCase(fetchAllComments.rejected, (state, action) => {
        state.allStatus = "failed"
        state.allError = action.payload ?? "Impossible de charger les commentaires"
      })

      // suppression : on retire le commentaire de toutes les listes
      .addCase(deleteComment.fulfilled, (state, action) => {
        const keep = (c) => c.id !== action.payload
        state.all = state.all.filter(keep)
        state.mine = state.mine.filter(keep)
        state.byDestination.items = state.byDestination.items.filter(keep)
      })
  },
})

export default commentsSlice.reducer
