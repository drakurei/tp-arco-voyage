// Client pour l'API dummyjson : https://dummyjson.com/docs
// Tous les appels ajax du site passent par ici
export const API_URL = "https://dummyjson.com"

// Erreur avec le code HTTP, pour savoir par exemple si le token a expiré (401)
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// Lance une requête HTTP (fetch) vers l'API
// options : les mêmes que fetch (method, body déjà converti en JSON...)
//           + token : ajoute l'en-tête Authorization si on est connecté
// apiRequest("/auth/login", { method: "POST", body: JSON.stringify(credentials) })
// apiRequest("/auth/me", { token })
export async function apiRequest(endpoint, { token, headers, ...options } = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    })
  } catch {
    // pas de réseau, serveur injoignable...
    throw new ApiError("Impossible de joindre le serveur, réessayez plus tard", 0)
  }

  // Conversion de la réponse JSON en objet JS
  const data = await response.json().catch(() => null)

  // Code HTTP d'erreur (400, 401, 500...) : on renvoie le message de l'API
  if (!response.ok) {
    throw new ApiError(data?.message ?? "Une erreur est survenue", response.status)
  }

  return data
}
