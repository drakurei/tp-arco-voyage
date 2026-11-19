import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest, rejectApiError } from "../../api/apiClient"
import { normalizeContact, toList } from "../../api/normalize"

// POST /api/contact/store.php : enregistrer une demande de contact
// Token facultatif : s'il est envoyé, la demande est liée au compte connecté
// message : { name, email, subject, message }
export const sendContact = createAsyncThunk("contact/sendContact", async (message, { getState, rejectWithValue }) => {
  const { token, user } = getState().auth
  try {
    await apiRequest("/api/contact/store.php", {
      method: "POST",
      token,
      // connecté : on fournit aussi l'id de l'utilisateur (colonne user_id)
      body: JSON.stringify(user ? { ...message, user_id: user.id } : message),
    })
    return message.name
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// GET /api/contact/index.php : toutes les demandes (admin)
export const fetchContacts = createAsyncThunk("contact/fetchContacts", async (_, { getState, rejectWithValue }) => {
  try {
    const data = await apiRequest("/api/contact/index.php", { token: getState().auth.token })
    return toList(data).map(normalizeContact)
  } catch (error) {
    return rejectApiError(error, rejectWithValue)
  }
})

// Etat initial
const initialState = {
  // demandes de contact (administration)
  list: [],
  listStatus: "idle",
  listError: null,

  // envoi du formulaire
  sendStatus: "idle",
  sendError: null,
  // nom de la dernière personne qui a écrit : sert au message de confirmation
  lastSender: null,
}

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    // ferme le message de confirmation (ou d'erreur)
    clearConfirmation: (state) => {
      state.lastSender = null
      state.sendStatus = "idle"
      state.sendError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendContact.pending, (state) => {
        state.sendStatus = "loading"
        state.sendError = null
        state.lastSender = null
      })
      .addCase(sendContact.fulfilled, (state, action) => {
        state.sendStatus = "succeeded"
        state.lastSender = action.payload
      })
      .addCase(sendContact.rejected, (state, action) => {
        state.sendStatus = "failed"
        state.sendError = action.payload ?? "L'envoi a échoué, réessayez plus tard"
      })

      .addCase(fetchContacts.pending, (state) => {
        state.listStatus = "loading"
        state.listError = null
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.listStatus = "succeeded"
        // la plus récente en premier
        state.list = [...action.payload].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.listStatus = "failed"
        state.listError = action.payload ?? "Impossible de charger les demandes"
      })
  },
})

export const { clearConfirmation } = contactSlice.actions

export const selectLastSender = (state) => state.contact.lastSender
export const selectContacts = (state) => state.contact.list

export default contactSlice.reducer
