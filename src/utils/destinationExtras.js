import { destinations as localDestinations } from "../data/destinations"
import { slugify } from "./format"

// L'API fournit l'essentiel (nom, capitale, description, image, coordonnées).
// Pour les pays déjà présents dans notre fichier de données, on ajoute
// le texte détaillé et la galerie photo. On compare le slug puis le nom.
export function findExtras(destination) {
  if (!destination) return null
  const slug = slugify(destination.slug)
  const name = slugify(destination.name)
  return (
    localDestinations.find((d) => slugify(d.slug) === slug || slugify(d.name) === name) ?? null
  )
}
