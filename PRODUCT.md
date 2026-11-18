# Product

## Register

brand

## Users

Le formateur React et des recruteurs qui parcourent le projet pour juger le travail. Ils ouvrent le site sur un ordinateur, cliquent sur quelques destinations, testent la connexion, les favoris et le thème clair / sombre.

## Product Purpose

arco-voyage présente neuf destinations (région, capitale, description, galerie photo). C'est un rendu de cours et une pièce de portfolio : il doit prouver une maîtrise de React (React Router, Redux, formulaires, authentification) et montrer un site soigné, avec une identité visuelle qui lui est propre.

## Brand Personality

Un carnet de route d'aventurier. Trois mots : annoté, collectionné, usé par le voyage.
Le site se lit comme un carnet qu'on feuillette : photos imprimées et scotchées, tampons de passeport, étiquettes à bagage, notes écrites à la main en marge. Chaleureux et personnel, jamais kitsch.

## Anti-references

- Tout ce qui fait « template généré par IA » : grilles de cartes identiques aux coins arrondis, ombres grises douces, dégradés décoratifs, petits labels en capitales au-dessus de chaque titre.
- Le site d'agence de voyage standard (photo plein écran + barre de recherche + cartes « Top destinations »).
- Le projet frère `voyages` (vert sauge, serif, navigation en bulle) : arco-voyage ne doit pas lui ressembler.
- Le carnet de voyage cliché : texture de vieux parchemin, police manuscrite partout, boussoles et cartes au trésor.

## Design Principles

1. Chaque élément d'interface est un objet de carnet : une photo est un tirage scotché, un bouton est une étiquette Dymo, une info pratique est une étiquette à bagage.
2. L'écriture manuscrite sert uniquement aux annotations courtes ; le texte à lire reste imprimé et lisible.
3. Des imperfections maîtrisées (légères rotations, encre de tampon irrégulière) qui se redressent quand on interagit.
4. Le contenu réel des destinations porte la page : les photos et les noms de lieux d'abord.

## Accessibility & Inclusion

WCAG AA : contrastes suffisants dans les deux thèmes, focus clavier visible, animations (photos qui se redressent, onglets) désactivées avec `prefers-reduced-motion`. Thème clair / sombre au choix de l'utilisateur (ThemeContext).
