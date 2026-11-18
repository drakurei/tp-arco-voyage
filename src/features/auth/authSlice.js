// Import des outils redux toolkit
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
// createSlice permet de créer un slice redux
// createAsyncThunk permet de gérer des actions asynchrones (API)

// Import de notre outil pour lancer nos requetes HTTP (fetch)
import { apiRequest } from '../../api/apiClient'

// Récupération de l'utilisateur depuis le localStorage
const storedUser = localStorage.getItem('user')
// Récupération du token depuis le localStorage
const storedToken = localStorage.getItem('token')

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
    user: parseUser(storedUser),
    token: storedToken || null,

    // Etat de nos requetes HTTP
    status: 'idle',
    // idle : aucune requete
    // loading : chargement
    // succeeded : succès
    // failed : erreur

    error: null,
}

export const loginUser = createAsyncThunk(
    // Nom unique de l'action redux
    'auth/loginUser',

    // fonction asynchrone exécutée lors du dispatch
    // credentials : { username, password } envoyés par dispatch(loginUser(credentials))
    // rejectWithValue : permet de renvoyer notre propre message d'erreur
    async ({ username, password }, { rejectWithValue }) => {
        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: { username, password, expiresInMins: 60 },
            })

            // Ce qui est retourné devient action.payload dans loginUser.fulfilled
            return {
                token: data.accessToken,
                user: {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    image: data.image,
                },
            }
        } catch (error) {
            // 400 : identifiants refusés par dummyjson
            // Ce qui est retourné devient action.payload dans loginUser.rejected
            return rejectWithValue(error.status === 400 ? 'Login ou mot de passe incorrect' : error.message)
        }
    }
)
// createAsyncThunk génère 3 actions :
// auth/loginUser/pending   : la requete part
// auth/loginUser/fulfilled : la requete a réussi
// auth/loginUser/rejected  : la requete a échoué

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
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.user = action.payload.user
                state.token = action.payload.token
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload ?? 'Une erreur est survenue'
            })
    },
})

export const { logout, clearAuthError } = authSlice.actions

// Sélecteurs : pour lire le state dans les composants avec useSelector
export const selectUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token

export default authSlice.reducer
