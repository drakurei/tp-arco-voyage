// Client pour l'API du cours (PHP + MySQL)
// L'adresse du serveur est dans le fichier .env : VITE_API_URL=https://...
// Tous les appels ajax du site passent par ici
export const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")

// Erreur avec le code HTTP, pour savoir par exemple si le token a expiré (401)
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// Message d'erreur renvoyé par l'API : selon la route, il peut s'appeler
// "message" ou "error", ou être une liste d'erreurs par champ
function errorMessage(data) {
  if (!data) return null
  if (typeof data === "string") return data
  if (typeof data.message === "string") return data.message
  if (typeof data.error === "string") return data.error
  const errors = data.errors ?? data.error
  if (Array.isArray(errors)) return errors.join(" ")
  if (errors && typeof errors === "object") return Object.values(errors).flat().join(" ")
  return null
}

// Lance une requête HTTP (fetch) vers l'API
// options : les mêmes que fetch (method, body déjà converti en JSON...)
//           + token : ajoute l'en-tête Authorization si on est connecté
// apiRequest("/api/auth/login.php", { method: "POST", body: JSON.stringify(credentials) })
// apiRequest("/api/favorites/index.php", { token })
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
    // pas de réseau, serveur injoignable, adresse de l'API absente du .env...
    throw new ApiError("Impossible de joindre le serveur, réessayez plus tard", 0)
  }

  // Conversion de la réponse JSON en objet JS
  const data = await response.json().catch(() => null)

  // Code HTTP d'erreur (400, 401, 500...) : on renvoie le message de l'API
  // Certaines API répondent 200 avec { success: false } : même traitement
  if (!response.ok || data?.success === false || data?.status === "error") {
    const status = response.ok ? 400 : response.status
    throw new ApiError(errorMessage(data) ?? "Une erreur est survenue", status)
  }

  return data
}

// À utiliser dans le catch des createAsyncThunk :
// on garde le message pour l'affichage et le code HTTP dans action.meta.status
// (authSlice déconnecte l'utilisateur si le token est refusé : 401)
export function rejectApiError(error, rejectWithValue) {
  return rejectWithValue(error.message ?? "Une erreur est survenue", { status: error.status ?? 0 })
}
