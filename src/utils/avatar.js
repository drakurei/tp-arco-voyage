import { useState } from "react"

// Avatars générés par DiceBear : https://www.dicebear.com/
// Une même "graine" (seed) donne toujours le même avatar
export const AVATAR_STYLES = [
  { id: "adventurer", label: "Aventurier" },
  { id: "notionists", label: "Croquis" },
  { id: "lorelei", label: "Portrait" },
]

export function avatarUrl(seed, style = "adventurer") {
  const safeSeed = encodeURIComponent(seed || "voyageur")
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${safeSeed}`
}

// Choix d'un avatar : un style + un numéro de tirage, à partir d'une graine (le login)
export function useAvatarChoice(baseSeed) {
  const [style, setStyle] = useState(AVATAR_STYLES[0].id)
  const [variant, setVariant] = useState(0)

  const seed = `${baseSeed?.trim() || "voyageur"}${variant ? `-${variant}` : ""}`

  return {
    url: avatarUrl(seed, style),
    style,
    setStyle,
    redraw: () => setVariant((n) => n + 1),
    reset: () => setVariant(0),
  }
}
