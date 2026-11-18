import { createSlice } from "@reduxjs/toolkit"

// API du cours : POST /api/contact/store.php et GET /api/contact/index.php (admin)
// dummyjson n'a pas de route de contact : les demandes sont gardées dans le store
// et sauvegardées dans le localStorage (clé "contacts", voir app/store.js)

// Récupération des demandes déjà envoyées depuis le localStorage
function readContacts() {
  try {
    const value = localStorage.getItem("contacts")
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

// Etat initial
const initialState = {
  // toutes les demandes de contact (la plus récente en premier)
  messages: readContacts(),
  // nom de la dernière personne qui a écrit : sert au message de confirmation
  lastSender: null,
}

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    // Enregistrer une demande de contact (équivalent de POST /contact/store.php)
    // action.payload : { name, email, subject, message, userId, username }
    // userId / username : le compte connecté, ou null pour un visiteur
    sendMessage: {
      reducer: (state, action) => {
        state.messages.unshift(action.payload)
        state.lastSender = action.payload.name
      },
      // prepare : on complète la demande (id et date) avant le reducer
      prepare: (message) => ({
        payload: { ...message, id: crypto.randomUUID(), sentAt: new Date().toISOString() },
      }),
    },
    // Supprimer une demande (administration)
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter((m) => m.id !== action.payload)
    },
    // ferme le message de confirmation
    clearConfirmation: (state) => {
      state.lastSender = null
    },
  },
})

export const { sendMessage, deleteMessage, clearConfirmation } = contactSlice.actions

export const selectLastSender = (state) => state.contact.lastSender
export const selectMessages = (state) => state.contact.messages

export default contactSlice.reducer
