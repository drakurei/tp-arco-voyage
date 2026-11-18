import { createSlice } from "@reduxjs/toolkit"

// Messages envoyés depuis le formulaire de contact
const initialState = {
  messages: [],
  // nom de la dernière personne qui a écrit : sert au message de confirmation
  lastSender: null,
}

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    // action.payload : { name, email, subject, message }
    sendMessage: {
      reducer: (state, action) => {
        state.messages.unshift(action.payload)
        state.lastSender = action.payload.name
      },
      // prepare : on complète le message (id et date) avant le reducer
      prepare: (message) => ({
        payload: { ...message, id: crypto.randomUUID(), sentAt: new Date().toISOString() },
      }),
    },
    // ferme le message de confirmation
    clearConfirmation: (state) => {
      state.lastSender = null
    },
  },
})

export const { sendMessage, clearConfirmation } = contactSlice.actions

export const selectLastSender = (state) => state.contact.lastSender
export const selectMessages = (state) => state.contact.messages

export default contactSlice.reducer
