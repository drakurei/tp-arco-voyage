import { createSlice } from "@reduxjs/toolkit"

// Thème graphique (accessibilité) : "light" ou "dark"
// Le choix est gardé dans le localStorage (voir app/store.js)
export const THEME_KEY = "arco_voyage_theme"

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === "light" || saved === "dark") return saved
  } catch {
    // localStorage indisponible
  }
  // Pas encore de choix : on suit le réglage du système
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: getInitialTheme() },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark"
    },
    setTheme: (state, action) => {
      state.mode = action.payload === "dark" ? "dark" : "light"
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions

export const selectTheme = (state) => state.theme.mode

export default themeSlice.reducer
