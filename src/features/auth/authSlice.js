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
    // rejectWithValue est une fonction fournie par createAsyncThunk
    // permet de récupérer une erreur personnalisée : dans notre cas l'erreur potentielle renvoyée par l'API

    // credentials : { username, password } envoyés par dispatch(loginUser(credentials))
    async (credentials, { rejectWithValue }) => {
        try {

            // dummyjson : la route de connexion est /auth/login
            const data = await apiRequest('/auth/login', {
                // methode : post
                method: 'POST',

                // conversion des données au format JSON
                body: JSON.stringify(credentials)
            })

            // dummyjson ne renvoie pas le rôle à la connexion :
            // on le récupère avec /auth/me (token nécessaire)
            const me = await apiRequest('/auth/me', { token: data.accessToken })

            return { ...data, role: me.role }

        } catch (error) {

            // 400 : dummyjson refuse les identifiants (message en anglais) : on le traduit
            if (error.status === 400) {
                return rejectWithValue('Login ou mot de passe incorrect')
            }

            return rejectWithValue(error.message)

        }
    }

)
export const registerUser = createAsyncThunk(
    // Nom unique de l'action redux
    'auth/registerUser',

    // userData : { username, email, password, firstName, lastName, gender, avatar }
    async ({ avatar, ...userData }, { rejectWithValue }) => {
        try {

            // dummyjson : la création d'un compte se fait sur /users/add
            // (il simule l'ajout sans l'enregistrer) et l'avatar s'appelle "image"
            return await apiRequest('/users/add', {
                // methode : post
                method: 'POST',

                // conversion des données au format JSON
                body: JSON.stringify({ ...userData, image: avatar })
            })

        } catch (error) {

            return rejectWithValue(error.message)

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
        // Nouvel avatar choisi sur le profil (sauvegardé avec l'utilisateur dans le localStorage)
        updateAvatar: (state, action) => {
            if (state.user) state.user.image = action.payload
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
                // réponse de dummyjson : { accessToken, id, username, email, ... }
                const { accessToken, id, username, email, firstName, lastName, image, role } = action.payload
                state.status = 'succeeded'
                state.token = accessToken
                // role : "admin", "moderator" ou "user"
                state.user = { id, username, email, firstName, lastName, image, role }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload ?? 'Une erreur est survenue'
            })

            // Inscription : on ne connecte pas l'utilisateur (dummyjson n'enregistre pas le compte)
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
    },
})

export const { logout, clearAuthError, updateAvatar } = authSlice.actions

// Sélecteurs : pour lire le state dans les composants avec useSelector
export const selectUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin'

export default authSlice.reducer
