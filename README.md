# tp-arco-voyage

Site de présentation de destinations de voyage, réalisé avec React, React Router et Redux Toolkit. Projet repris de TP Voyage avec un nouveau design.

Site en ligne : https://drakurei.github.io/tp-arco-voyage/

## Pages

- **Accueil** : présentation du projet
- **Destinations** : liste des pays avec un lien vers chaque fiche, et une recherche rapide
- **Détails** : description, capitale, région (lien vers la région), photos et bouton favoris
- **Région** (`/region/:region`) : destinations d'une région
- **Recherche** : par mots-clés et/ou région, validée avec yup
- **Contact** : formulaire validé avec react-hook-form et yup
- **Connexion / Inscription** : via l'API [dummyjson](https://dummyjson.com/docs/auth)
- **Profil** (connecté) : informations récupérées avec `/auth/me`
- **Favoris** (connecté) : destinations ajoutées en favoris, possibilité de les retirer
- **À propos**
- **404** : page affichée pour une adresse inconnue

## Fonctionnalités

- Authentification avec Redux : `authSlice` (thunk `login`, `logout`, token gardé dans le localStorage) et routes protégées avec `ProtectedRoute`
- Formulaire de contact branché sur `contactSlice` (messages envoyés gardés dans le store)
- Thème clair / sombre avec `ThemeContext`, choix gardé dans le localStorage
- Favoris par utilisateur avec `FavoritesContext`, stockés dans le localStorage, sans doublon

Compte de test dummyjson : `emilys` / `emilyspass`

## Technologies

- React
- React Router
- Redux Toolkit et React Redux
- React Bootstrap
- React Hook Form et Yup
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
  components/   Navbar, ProtectedRoute
  context/      ThemeContext, FavoritesContext
  data/         destinations
  layouts/      MainLayout
  pages/        Accueil, Destinations, Détails, Région, Recherche, Contact,
                Connexion, Inscription, Profil, Favoris, À propos, 404
  router/       Router
  api/          apiClient (appels à dummyjson)
  app/          store Redux
  features/     auth/authSlice, contact/contactSlice
```

## Auteur

Jonathan Davy
