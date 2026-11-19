// Mise en forme des réponses de l'API
// La base de données utilise des noms en snake_case (first_name, region_id, created_at...)
// alors que le site utilise le camelCase (firstName, regionId, createdAt...).
// On convertit une seule fois, ici, pour que les composants n'aient pas à s'en soucier.

// L'API peut renvoyer directement la donnée, ou l'emballer : { success, message, data }
export function unwrap(data) {
  if (data && typeof data === "object" && !Array.isArray(data) && "data" in data) {
    return data.data
  }
  return data
}

// Une liste : soit un tableau, soit le premier tableau trouvé dans la réponse
// ({ data: [...] }, { destinations: [...] }, { users: [...] }...)
export function toList(data) {
  const value = unwrap(data)
  if (Array.isArray(value)) return value
  if (value && typeof value === "object") {
    const firstArray = Object.values(value).find(Array.isArray)
    if (firstArray) return firstArray
  }
  return []
}

// Un seul objet : { data: {...} }, { destination: {...} } ou directement l'objet
export function toItem(data, key) {
  const value = unwrap(data)
  if (value && typeof value === "object" && key && value[key] && typeof value[key] === "object") {
    return value[key]
  }
  return value
}

// Nombre ou null ("46.2276" -> 46.2276)
function toNumber(value) {
  if (value === null || value === undefined || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

// ---------- Utilisateurs ----------
export function normalizeUser(raw) {
  if (!raw) return null
  const avatar = raw.avatar ?? raw.image ?? null
  return {
    id: toNumber(raw.id ?? raw.user_id ?? raw.userId ?? raw.sub),
    username: raw.username ?? "",
    email: raw.email ?? "",
    firstName: raw.firstName ?? raw.first_name ?? "",
    lastName: raw.lastName ?? raw.last_name ?? "",
    gender: raw.gender ?? "",
    avatar,
    image: avatar,
    role: raw.role ?? "membre",
    createdAt: raw.createdAt ?? raw.created_at ?? null,
  }
}

// Lecture du contenu d'un token JWT (sans vérification : c'est le rôle du serveur)
// Sert de secours si la réponse de connexion ne contient pas l'utilisateur
export function readToken(token) {
  try {
    const part = token.split(".")[1]
    const binary = atob(part.replace(/-/g, "+").replace(/_/g, "/"))
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const payload = JSON.parse(new TextDecoder().decode(bytes))
    return payload.data ?? payload.user ?? payload
  } catch {
    return null
  }
}

// ---------- Régions ----------
export function normalizeRegion(raw) {
  return {
    id: toNumber(raw.id),
    slug: raw.slug ?? "",
    name: raw.name ?? raw.slug ?? "",
  }
}

// ---------- Destinations ----------
export function normalizeDestination(raw) {
  if (!raw) return null
  // la région peut arriver en objet ({ id, slug, name }), en texte, ou à plat (region_name...)
  const region = raw.region && typeof raw.region === "object" ? raw.region : null
  return {
    id: toNumber(raw.id),
    slug: raw.slug ?? "",
    name: raw.name ?? "",
    capital: raw.capital ?? "",
    description: raw.description ?? "",
    image: raw.image ?? "",
    lat: toNumber(raw.lat ?? raw.latitude),
    long: toNumber(raw.long ?? raw.lng ?? raw.longitude),
    regionId: toNumber(raw.region_id ?? raw.regionId ?? region?.id),
    regionName:
      raw.region_name ?? raw.regionName ?? region?.name ?? (typeof raw.region === "string" ? raw.region : ""),
    regionSlug: raw.region_slug ?? raw.regionSlug ?? region?.slug ?? "",
    createdBy: toNumber(raw.created_by ?? raw.createdBy),
  }
}

// ---------- Commentaires ----------
export function normalizeComment(raw) {
  const user = raw.user && typeof raw.user === "object" ? raw.user : null
  const destination = raw.destination && typeof raw.destination === "object" ? raw.destination : null
  return {
    id: toNumber(raw.id),
    userId: toNumber(raw.user_id ?? raw.userId ?? user?.id),
    username: raw.username ?? user?.username ?? "",
    avatar: raw.avatar ?? raw.user_avatar ?? user?.avatar ?? null,
    destinationId: toNumber(raw.destination_id ?? raw.destinationId ?? destination?.id),
    destinationName: raw.destination_name ?? raw.destinationName ?? destination?.name ?? raw.name ?? "",
    destinationSlug: raw.destination_slug ?? raw.destinationSlug ?? destination?.slug ?? raw.slug ?? "",
    content: raw.content ?? "",
    rating: toNumber(raw.rating),
    createdAt: raw.created_at ?? raw.createdAt ?? null,
  }
}

// ---------- Favoris ----------
export function normalizeFavorite(raw) {
  return {
    id: toNumber(raw.id),
    // destination_id est un varchar dans la table favorites : on le repasse en nombre
    destinationId: toNumber(raw.destination_id ?? raw.destinationId),
    title: raw.destination_title ?? raw.title ?? "",
    image: raw.destination_image ?? raw.image ?? "",
    createdAt: raw.created_at ?? raw.createdAt ?? null,
  }
}

// ---------- Demandes de contact ----------
export function normalizeContact(raw) {
  return {
    id: toNumber(raw.id),
    userId: toNumber(raw.user_id ?? raw.userId),
    username: raw.username ?? null,
    name: raw.name ?? "",
    email: raw.email ?? "",
    subject: raw.subject ?? "",
    message: raw.message ?? "",
    createdAt: raw.created_at ?? raw.createdAt ?? null,
  }
}
