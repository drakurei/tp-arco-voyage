// Import des outils redux toolkit
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
// createSlice permet de créer un slice redux
// createAsyncThunk permet de gérer des actions asynchrones (API)

// Import de notre outil pour lancer nos requetes HTTP (fetch)
import { apiRequest, rejectApiError } from '../../api/apiClient'
import { normalizeUser, readToken, unwrap } from '../../api/normalize'
import { updateProfile } from '../users/usersSlice'

// Récupération de l'utilisateur depuis le localStorage
const storedUser = localStorage.getItem('user')
// Récupération du token depuis le localStorage
const storedToken = localStorage.getItem('token')

// Date d'expiration du token (champ "exp" du JWT, en secondes) ou null s'il n'en a pas
export function tokenExpiresAt(token) {
    const exp = token ? readTokenRoot(token)?.exp : null
    return typeof exp === 'number' ? exp * 1000 : null
}

// Le contenu complet du token (readToken renvoie seulement la partie "data")
function readTokenRoot(token) {
    try {
        const part = token.split('.')[1]
        return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
    } catch {
        return null
    }
}

// Token périmé au chargement du site : on ne garde pas la session
const expiresAt = tokenExpiresAt(storedToken)
const sessionValid = Boolean(storedToken) && (expiresAt === null || expiresAt > Date.now())

// Lecture sûre de l'utilisateur (une valeur abîmée ne doit pas casser le site)
function parseUser(value) {
    try {
        return value ? JSON.parse(value) : null
    } catch {
        return null
    }
}

// Etat initial
const initialState = {
    // Si un utilisateur est connecté sinon null
    user: sessionValid ? parseUser(storedUser) : null,
    token: sessionValid ? storedToken : null,

    // Etat de nos requetes HTTP
    status: 'idle',
    // idle : aucune requete
    // loading : chargement
    // succeeded : succès
    // failed : erreur

    error: null,

    // message affiché sur la page de connexion après une déconnexion forcée
    // (gardé à part de "error" : il ne doit pas disparaître quand on efface les erreurs du formulaire)
    notice: null,
}

export const loginUser = createAsyncThunk(
    // Nom unique de l'action redux
    'auth/loginUser',

    // fonction asynchrone exécutée lors du dispatch
    // rejectWithValue est une fonction fournie par createAsyncThunk
    // permet de récupérer une erreur personnalisée : dans notre cas l'erreur potentielle renvoyée par l'API

    // credentials : { username, password } envoyés par dispatch(loginUser(credentials))
    async (credentials, { rejectWithValue }) => {
        try {

            const data = await apiRequest('/api/auth/login.php', {
                // methode : post
                method: 'POST',

                // conversion des données au format JSON
                body: JSON.stringify(credentials)
            })

            // la réponse contient le token JWT et l'utilisateur
            // (à la racine ou dans "data" selon la version de l'API)
            const payload = unwrap(data) ?? {}
            const token = payload.token ?? payload.jwt ?? payload.accessToken ?? data.token
            const user = payload.user ?? data.user ?? readToken(token)

            if (!token) {
                return rejectWithValue("La réponse du serveur ne contient pas de token")
            }

            return { token, user: normalizeUser(user) }

        } catch (error) {

            // 401 : identifiants refusés
            if (error.status === 401) {
                return rejectWithValue('Login ou mot de passe incorrect')
            }

            return rejectApiError(error, rejectWithValue)

        }
    }

)

export const registerUser = createAsyncThunk(
    // Nom unique de l'action redux
    'auth/registerUser',

    // userData : { username, email, password, firstName, lastName, gender, avatar }
    async (userData, { rejectWithValue }) => {
        try {

            return await apiRequest('/api/auth/register.php', {
                // methode : post
                method: 'POST',

                // conversion des données au format JSON
                body: JSON.stringify(userData)
            })

        } catch (error) {

            return rejectApiError(error, rejectWithValue)

        }
    }
)

// createAsyncThunk génère 3 actions :
// auth/loginUser/pending   : la requete part
// auth/loginUser/fulfilled : la requete a réussi (action.payload = la réponse de l'API)
// auth/loginUser/rejected  : la requete a échoué (action.payload = le message d'erreur)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Déconnexion : on oublie le token et l'utilisateur
        logout: (state) => {
            state.user = null
            state.token = null
            state.status = 'idle'
            state.error = null
        },
        // Le token est arrivé à expiration pendant la visite
        sessionExpired: (state) => {
            state.user = null
            state.token = null
            state.status = 'idle'
            state.notice = 'Votre session a expiré, reconnectez-vous.'
        },
        // Efface le message d'erreur de connexion (quand on quitte la page)
        clearAuthError: (state) => {
            state.status = 'idle'
            state.error = null
        },
    },
    // Les actions générées par createAsyncThunk se traitent dans extraReducers
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading'
                state.error = null
                state.notice = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.token = action.payload.token
                // role : "membre" ou "admin" (enum de la table users)
                state.user = action.payload.user
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload ?? 'Une erreur est survenue'
            })

            // Inscription : on ne connecte pas l'utilisateur, la page le renvoie vers /login
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.status = 'succeeded'
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload ?? "L'inscription a échoué, réessayez plus tard"
            })

            // Profil modifié (usersSlice) : on met à jour l'utilisateur gardé en session
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.user = { ...state.user, ...action.payload }
            })

            // N'importe quelle requête refusée avec un 401 alors qu'on est connecté :
            // le token a expiré, on déconnecte l'utilisateur
            .addMatcher(
                (action) => action.type.endsWith('/rejected') && action.meta?.status === 401,
                (state) => {
                    if (!state.token) return
                    state.user = null
                    state.token = null
                    state.status = 'idle'
                    state.notice = 'Votre session a expiré, reconnectez-vous.'
                }
            )
    },
})

export const { logout, clearAuthError, sessionExpired } = authSlice.actions

// Sélecteurs : pour lire le state dans les composants avec useSelector
export const selectUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin'

export default authSlice.reducer
