# Authentification et Upload dans Joezik

Ce document explique les améliorations apportées à l'authentification et à l'upload de fichiers dans l'application Joezik.

## Authentification

### Fonctionnalités ajoutées

- Formulaire de connexion/inscription permettant aux utilisateurs de se connecter avec leurs propres informations
- Possibilité de s'inscrire avec un nom d'utilisateur, un email et un mot de passe
- Option pour continuer en tant qu'invité (génère automatiquement un compte)
- Gestion des erreurs de connexion et d'inscription

### Fichiers modifiés

- `src/components/auth/AuthForm.tsx` : Nouveau composant pour le formulaire de connexion/inscription
- `src/app/page.tsx` : Intégration du composant AuthForm dans la page principale

### Fonctionnement

1. Lorsqu'un utilisateur n'est pas connecté, une modal de connexion/inscription s'affiche
2. L'utilisateur peut choisir de se connecter, de s'inscrire ou de continuer en tant qu'invité
3. Les informations sont envoyées aux routes API correspondantes
4. En cas de succès, l'utilisateur est connecté et la modal se ferme
5. En cas d'erreur, un message d'erreur s'affiche

## Upload de fichiers

### Améliorations apportées

- Correction de la route d'upload pour gérer correctement les requêtes GET avec et sans paramètres
- Ajout de la route DELETE pour supprimer des fichiers
- Correction de l'ID de la playlist par défaut pour qu'il corresponde à l'ID réel dans la base de données

### Fichiers modifiés

- `src/app/api/upload/route.ts` : Amélioration de la route d'upload
- `src/app/page.tsx` : Correction de l'ID de la playlist par défaut

### Fonctionnement

1. L'utilisateur peut uploader un fichier audio via le formulaire d'ajout de piste
2. Le fichier est envoyé à la route `/api/upload` qui le sauvegarde sur le serveur
3. Les métadonnées du fichier sont stockées dans la base de données SQLite
4. Une piste est créée avec un lien vers le fichier audio
5. La piste est ajoutée à la playlist par défaut

## Utilisation

### Connexion

1. Cliquez sur "Connexion" dans l'onglet de la modal
2. Entrez votre email et votre mot de passe
3. Cliquez sur "Se connecter"

### Inscription

1. Cliquez sur "Inscription" dans l'onglet de la modal
2. Entrez votre nom d'utilisateur, email, mot de passe et confirmation du mot de passe
3. Cliquez sur "S'inscrire"

### Upload de fichier audio

1. Cliquez sur "Ajouter un fichier audio" dans le formulaire d'ajout de piste
2. Sélectionnez un fichier audio sur votre ordinateur
3. Le fichier est uploadé et ajouté à la playlist

## Dépannage

### Problèmes d'authentification

- Vérifiez que vous utilisez un email valide
- Assurez-vous que votre mot de passe est correct
- Vérifiez que les mots de passe correspondent lors de l'inscription

### Problèmes d'upload

- Vérifiez que le fichier est bien un fichier audio
- Assurez-vous que le fichier n'est pas trop volumineux
- Vérifiez que vous êtes bien connecté avant d'uploader un fichier
