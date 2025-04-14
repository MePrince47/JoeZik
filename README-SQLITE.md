# Intégration de SQLite dans Joezik

Ce document explique comment l'application Joezik a été configurée pour utiliser SQLite comme base de données backend.

## Architecture

L'application utilise une architecture adaptative qui permet de basculer entre le stockage local (localStorage) et SQLite. Cela est réalisé grâce à un adaptateur de stockage qui sélectionne dynamiquement le service approprié en fonction de la configuration.

### Fichiers principaux

- `db/schema.ts` : Définit le schéma de la base de données SQLite
- `db/index.ts` : Configure la connexion à la base de données SQLite
- `db/init.ts` : Script d'initialisation de la base de données
- `src/lib/storage/storageAdapter.js` : Adaptateur qui permet de basculer entre localStorage et SQLite
- `src/lib/auth/authServiceSQLite.ts` : Service d'authentification utilisant SQLite
- `src/lib/playlist/trackServiceSQLite.ts` : Service de gestion des playlists et des pistes utilisant SQLite
- `src/lib/chat/chatServiceSQLite.ts` : Service de chat utilisant SQLite
- `src/lib/storage/fileServiceSQLite.ts` : Service de gestion des fichiers utilisant SQLite

### Routes API

Les routes API ont été mises à jour pour utiliser SQLite :

- `/api/auth/*` : Routes d'authentification
- `/api/playlists/*` : Routes de gestion des playlists
- `/api/tracks/*` : Routes de gestion des pistes
- `/api/chat/*` : Routes de gestion du chat
- `/api/upload/*` : Routes de gestion des fichiers uploadés
- `/api/users/*` : Routes de gestion des utilisateurs
- `/api/migrate` : Route pour migrer les données de localStorage vers SQLite

## Configuration

Pour activer SQLite, définissez la variable d'environnement `NEXT_PUBLIC_USE_SQLITE` à `true` dans le fichier `.env.local` :

```
NEXT_PUBLIC_USE_SQLITE=true
```

## Scripts utilitaires

Plusieurs scripts ont été ajoutés pour faciliter la gestion de la base de données :

- `npm run init-db` : Initialise la base de données SQLite
- `npm run migrate` : Migre les données de localStorage vers SQLite
- `npm run create-default-playlist` : Crée une playlist par défaut dans la base de données

## Migration des données

Pour migrer les données de localStorage vers SQLite, suivez ces étapes :

1. Assurez-vous que la base de données SQLite est initialisée : `npm run init-db`
2. Exécutez le script de migration : `npm run migrate`

## Structure de la base de données

La base de données SQLite contient les tables suivantes :

- `users` : Stocke les informations des utilisateurs
- `playlists` : Stocke les informations des playlists
- `tracks` : Stocke les informations des pistes
- `track_votes` : Stocke les votes des utilisateurs pour les pistes
- `chat_messages` : Stocke les messages du chat
- `audio_files` : Stocke les métadonnées des fichiers audio uploadés

## Développement

Pour développer de nouvelles fonctionnalités utilisant SQLite, suivez ces bonnes pratiques :

1. Créez un service SQLite pour chaque domaine fonctionnel (auth, playlist, chat, etc.)
2. Utilisez l'adaptateur de stockage pour basculer entre localStorage et SQLite
3. Testez votre code avec les deux modes de stockage

## Déploiement

Lors du déploiement, assurez-vous que :

1. La variable d'environnement `NEXT_PUBLIC_USE_SQLITE` est correctement définie
2. La base de données SQLite est initialisée avant le démarrage de l'application
3. Les migrations nécessaires sont exécutées

## Dépannage

Si vous rencontrez des problèmes avec SQLite :

1. Vérifiez que la base de données est correctement initialisée
2. Vérifiez que les services SQLite sont correctement importés
3. Consultez les logs pour identifier les erreurs potentielles
