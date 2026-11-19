import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest, rejectApiError } from "../../api/apiClient"
import { normalizeUser, toItem, toList } from "../../api/normalize"

// ---------- Administration ----------

// GET /api/users/index.php : liste des utilisateurs (admin)
export const fetchUsers = createAsyncThunk("users/fetchUsers", async (_, { getState, rejectWithValue }) => {
  try {
    const data = await apiRequest("/api/users/index.php", { token: getState().auth.token })
    return toList(data).map(normalizeUser)
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// POST /api/users/change-password.php : l'admin change le mot de passe d'un utilisateur
// passwords : { userId, newPassword, confirmPassword }
export const adminChangePassword = createAsyncThunk(
  "users/adminChangePassword",
  async ({ userId, newPassword, confirmPassword }, { getState, rejectWithValue }) => {
    try {
      return await apiRequest("/api/users/change-password.php", {
        method: "POST",
        token: getState().auth.token,
        body: JSON.stringify({ user_id: userId, newPassword, confirmPassword }),
      })
    } catch (error) {
      return rejectApiError(error, rejectWithValue)
    }
  }
)

// ---------- Utilisateur connecté ----------

// POST /api/profile/update.php : modifier ses informations (sans le mot de passe)
// profile : { username, email, firstName, lastName, gender, avatar }
export const updateProfile = createAsyncThunk("users/updateProfile", async (profile, { getState, rejectWithValue }) => {
  try {
    const data = await apiRequest("/api/profile/update.php", {
      method: "POST",
      token: getState().auth.token,
      body: JSON.stringify(profile),
    })
    // Si l'API renvoie l'utilisateur modifié on le prend, sinon on garde ce qu'on a envoyé
    const returned = toItem(data, "user")
    const user = returned && typeof returned === "object" && returned.username ? normalizeUser(returned) : null
    // l'image est synchronisée avec l'avatar côté serveur
    return user ?? { ...profile, image: profile.avatar }
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// POST /api/profile/change-password.php : changer son propre mot de passe
// passwords : { currentPassword, newPassword, confirmPassword }
export const changeMyPassword = createAsyncThunk(
  "users/changeMyPassword",
  async (passwords, { getState, rejectWithValue }) => {
    try {
      return await apiRequest("/api/profile/change-password.php", {
        method: "POST",
        token: getState().auth.token,
        body: JSON.stringify(passwords),
      })
    } catch (error) {
      // un mauvais mot de passe actuel peut revenir en 401 :
      // ici ce n'est pas un token expiré, on ne déconnecte pas l'utilisateur
      if (error.status === 401) return rejectWithValue("Le mot de passe actuel est incorrect")
      return rejectApiError(error, rejectWithValue)
    }
  }
)

const initialState = {
  // liste des utilisateurs (administration)
  list: [],
  status: "idle",
  error: null,
}

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.list = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload ?? "Impossible de charger les utilisateurs"
      })
      // le profil de l'admin lui-même a changé : on met la liste à jour
      .addCase(updateProfile.fulfilled, (state, action) => {
        const index = state.list.findIndex((u) => u.id === action.payload.id)
        if (index !== -1) state.list[index] = { ...state.list[index], ...action.payload }
      })
  },
})

export const selectUsers = (state) => state.users.list
export const selectUsersStatus = (state) => state.users.status
export const selectUsersError = (state) => state.users.error

export default usersSlice.reducer
