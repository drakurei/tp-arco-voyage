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

// apiRequest("/auth/login", { method: "POST", body: {...} })
// apiRequest("/auth/me", { token })
export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = {}
  if (body) headers["Content-Type"] = "application/json"
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    // pas de réseau, serveur injoignable...
    throw new ApiError("Impossible de joindre le serveur, réessayez plus tard", 0)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(data?.message ?? "Une erreur est survenue", response.status)
  }

  return data
}
