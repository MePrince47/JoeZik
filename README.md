# Guide de Démarrage JoeZik

Ce document explique comment installer, configurer et lancer l'application JoeZik sur votre ordinateur local.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé:

- **Node.js** (version 18.0.0 ou supérieure)
- **npm** (version 8.0.0 ou supérieure)
- **Git** (optionnel, pour le versionnement)

## Installation

1. **Cloner le projet** (si ce n'est pas déjà fait):

```bash
git clone [URL_DU_REPO]
cd joezik
```

2. **Installer les dépendances**:

```bash
npm install
```

Cette commande installera toutes les dépendances nécessaires définies dans le fichier `package.json`, notamment:
- Next.js
- React et React DOM
- Bootstrap et React-Bootstrap
- React-Icons
- UUID
- Socket.io (si implémenté)

## Configuration

### Configuration de la base de données (si applicable)

Si vous utilisez une base de données locale (SQLite):

1. Initialiser Prisma:

```bash
npx prisma init --datasource-provider sqlite
```

2. Appliquer les migrations:

```bash
npx prisma migrate dev --name init
```

3. Générer le client Prisma:

```bash
npx prisma generate
```

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes:

```
# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# YouTube API (optionnel)
NEXT_PUBLIC_YOUTUBE_API_KEY=votre_clé_api_youtube

# Authentification (si implémentée)
NEXTAUTH_SECRET=votre_secret_nextauth
NEXTAUTH_URL=http://localhost:3000

# Temps réel (si Ably ou Pusher est utilisé)
NEXT_PUBLIC_ABLY_API_KEY=votre_clé_ably
# OU
NEXT_PUBLIC_PUSHER_APP_KEY=votre_clé_pusher
PUSHER_APP_ID=votre_app_id_pusher
PUSHER_SECRET=votre_secret_pusher
```

## Lancement de l'application

### Mode développement

Pour lancer l'application en mode développement avec rechargement à chaud:

```bash
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

### Mode production (pour tester localement)

Pour construire et lancer l'application en mode production:

```bash
npm run build
npm start
```

## Utilisation de JoeZik

### Fonctionnalités principales

1. **Création d'une playlist**:
   - Cliquez sur "Créer une playlist" depuis la page d'accueil
   - Donnez un titre et une description à votre playlist
   - Choisissez si la playlist est publique ou privée

2. **Ajout de morceaux**:
   - Dans une playlist, cliquez sur "Ajouter un morceau"
   - Vous pouvez ajouter des morceaux via YouTube ou en uploadant des fichiers audio

3. **Système de vote**:
   - Votez pour les morceaux avec les boutons pouce haut/bas
   - Les morceaux avec le plus de votes seront joués en priorité

4. **Chat en temps réel**:
   - Communiquez avec les autres utilisateurs dans l'onglet Chat
   - Voir qui est connecté dans l'onglet Utilisateurs

### Raccourcis clavier

- **Espace**: Lecture/Pause
- **Flèche droite**: Morceau suivant
- **Flèche gauche**: Morceau précédent
- **M**: Couper/Rétablir le son
- **↑/↓**: Ajuster le volume

## Résolution des problèmes courants

### L'application ne démarre pas

- Vérifiez que toutes les dépendances sont installées: `npm install`
- Vérifiez que les variables d'environnement sont correctement configurées
- Vérifiez les logs dans la console pour identifier les erreurs

### Les vidéos YouTube ne se chargent pas

- Assurez-vous d'avoir une connexion Internet active
- Vérifiez que l'URL YouTube est valide et accessible
- Si vous utilisez une clé API YouTube, vérifiez qu'elle est valide

### Problèmes de temps réel (chat, votes)

- Vérifiez votre connexion Internet
- Rafraîchissez la page pour rétablir la connexion
- Si vous utilisez Socket.io, vérifiez que le serveur est bien démarré

## Développement avancé

### Structure du projet

```
/src
├── app/                  # Pages et routes Next.js
├── components/           # Composants React réutilisables
├── lib/                  # Utilitaires, configuration, etc.
├── styles/               # Styles globaux et composants
└── types/                # Définitions TypeScript
```

### Commandes utiles

- **Linter**: `npm run lint`
- **Tests**: `npm test` (si configurés)
- **Prisma Studio** (interface d'administration de la base de données): `npx prisma studio`

## Ressources additionnelles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation React](https://reactjs.org/docs/getting-started.html)
- [Documentation Bootstrap](https://getbootstrap.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
# JoeZik
