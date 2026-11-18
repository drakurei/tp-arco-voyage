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
