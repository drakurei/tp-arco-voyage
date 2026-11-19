# tp-arco-voyage

Site de présentation de destinations de voyage, réalisé avec React, React Router et Redux Toolkit. Projet repris de TP Voyage avec un nouveau design.

Site en ligne : https://drakurei.github.io/tp-arco-voyage/

## Pages

- **Accueil** : présentation du projet
- **Destinations** : liste des pays (API), raccourcis par région et recherche rapide
- **Détails** : description, capitale, région, carte (Leaflet / OpenStreetMap), bouton favori, commentaires
- **Région** (`/region/:slug`) : destinations d'une région
- **Recherche** : par mot-clé, par région, ou mot-clé dans une région
- **Voyageurs** : registre public de ceux qui ont écrit, et page publique de chaque voyageur (ses notes, les régions parcourues, les destinations notées). Construit à partir des commentaires, la liste des comptes étant réservée à l'admin
- **Contact** : formulaire envoyé à l'API, pré-rempli si l'utilisateur est connecté
- **Connexion / Inscription** : après l'inscription, redirection vers la connexion
- **Profil** (connecté) : passeport avec les données du compte, modification des informations et du mot de passe
  - sous-pages **Favoris** et **Commentaires**
- **Tableau de bord** (admin) : sommaire, demandes de contact, voyageurs (changement de mot de passe), destinations (création, suppression par son créateur), commentaires (suppression)
- **À propos**
- **404** : page affichée pour une adresse inconnue

## Fonctionnalités

- Redux Toolkit : un slice par domaine (`auth`, `contact`, `destinations`, `comments`, `favorites`, `users`, `search`, `theme`), appels à l'API avec `createAsyncThunk`
- Token JWT gardé dans le localStorage, déconnexion automatique si l'API répond 401
- Routes protégées : `ProtectedRoute` (connecté) et `AdminRoute` (rôle admin)
- Fenêtres de confirmation (React Bootstrap) pour les suppressions, les favoris, le profil et le mot de passe
- Thème clair / sombre avec `themeSlice`, choix gardé dans le localStorage
- Avatars générés avec [DiceBear](https://www.dicebear.com/)
- Vue « Carte » sur la page Destinations : tous les pays sur une carte, cliquables
- Note moyenne (calculée à partir des commentaires) et cœur favori sur chaque carte de destination
- Tableaux de l'administration triables (clic sur l'en-tête) et filtrables
- Déconnexion automatique à l'expiration du token JWT
- Photos manquantes remplacées par un emplacement « photo égarée »
- Profil, administration et cartes Leaflet chargés à la demande (`React.lazy`)

## Configuration

L'adresse de l'API se règle dans un fichier `.env` à la racine (voir `.env.example`) :

```
VITE_API_URL=https://adresse-de-l-api
```

## Technologies

- React
- React Router
- Redux Toolkit et React Redux
- React Bootstrap
- React Hook Form et Yup
- Leaflet et React Leaflet
- Vite

## Installation

```bash
npm install
npm run dev
```

## Déploiement

```bash
npm run deploy
```

Le site est publié sur GitHub Pages depuis la branche `gh-pages`.

## Arborescence

```
src/
  api/          apiClient (fetch vers l'API), normalize (mise en forme des réponses)
  app/          store Redux
  features/     auth, contact, destinations, comments, favorites, users, search, theme
  components/   Navbar, routes protégées, fenêtres, carte, commentaires...
  data/         textes et galeries photo complémentaires
  layouts/      MainLayout, ProfileLayout, AdminLayout
  pages/        pages publiques, profil, admin/ (tableau de bord)
  router/       Router
  utils/        avatar, format (dates, slug)
```

## Auteur

Jonathan Davy
