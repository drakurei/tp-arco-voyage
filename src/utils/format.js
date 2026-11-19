// Dates de l'API : format MySQL "2026-11-18 14:05:00" (ou ISO)
function toDate(value) {
  if (!value) return null
  const date = new Date(String(value).replace(" ", "T"))
  return Number.isNaN(date.getTime()) ? null : date
}

// "18/11/2026"
export function formatDay(value) {
  const date = toDate(value)
  return date ? date.toLocaleDateString("fr-FR") : ""
}

// "18/11/2026 à 14:05"
export function formatDateTime(value) {
  const date = toDate(value)
  if (!date) return ""
  return `${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
}

// "18 novembre 2026"
export function formatLongDate(value) {
  const date = toDate(value)
  return date ? date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""
}

// 1 destination, 2 destinations
export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count > 1 ? pluralForm : singular}`
}

// "Côte d'Ivoire" -> "cote-d-ivoire" (pour proposer un slug)
export function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
