import { useMemo, useState } from "react"

// Texte comparable : minuscules, sans accents ("Pérou" et "perou" se retrouvent)
function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

// Filtre + tri d'une liste pour les tableaux de l'administration
// items     : la liste à afficher
// columns   : { cle: (item) => valeur } pour chaque colonne triable
// searchIn  : (item) => texte dans lequel on cherche le filtre
// initial   : tri de départ { key, direction: "asc" | "desc" }
export function useTableControls(items, { columns, searchIn, initial }) {
  const [filter, setFilter] = useState("")
  const [sort, setSort] = useState(initial)

  const rows = useMemo(() => {
    const words = normalize(filter).split(/\s+/).filter(Boolean)
    // tous les mots tapés doivent apparaître (ordre libre)
    const filtered = words.length
      ? items.filter((item) => {
          const text = normalize(searchIn(item))
          return words.every((word) => text.includes(word))
        })
      : items

    const getValue = columns[sort?.key]
    if (!getValue) return filtered

    const factor = sort.direction === "desc" ? -1 : 1
    return [...filtered].sort((a, b) => {
      const va = getValue(a)
      const vb = getValue(b)
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * factor
      return normalize(va).localeCompare(normalize(vb), "fr", { numeric: true }) * factor
    })
  }, [items, filter, sort, columns, searchIn])

  // clic sur un en-tête : tri croissant, puis décroissant
  const toggleSort = (key) =>
    setSort((current) =>
      current?.key === key ? { key, direction: current.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }
    )

  return { rows, filter, setFilter, sort, toggleSort }
}
