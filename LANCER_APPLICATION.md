# Guide Rapide pour Lancer JoeZik

Ce guide concis explique comment lancer l'application JoeZik sur votre ordinateur.

## Étape 1: Vérifier les prérequis

Assurez-vous d'avoir:
- Node.js installé (vérifiez avec `node -v`)
- npm installé (vérifiez avec `npm -v`)

## Étape 2: Installer les dépendances (première fois uniquement)

Si c'est la première fois que vous lancez l'application:

```bash
# Naviguez vers le dossier du projet
cd chemin/vers/joezik

# Installez les dépendances
npm install
```

## Étape 3: Lancer l'application

### En mode développement (recommandé)

```bash
npm run dev
```

L'application sera accessible à l'adresse: [http://localhost:3000](http://localhost:3000)

### En mode production (optionnel)

```bash
npm run build
npm start
```

## Étape 4: Utiliser l'application

1. Ouvrez votre navigateur à l'adresse [http://localhost:3000](http://localhost:3000)
2. Vous verrez l'interface JoeZik avec:
   - La file d'attente des morceaux à gauche
   - Le lecteur principal au centre
   - La liste des utilisateurs et le chat à droite

3. Pour ajouter un morceau:
   - Cliquez sur "Ajouter un morceau"
   - Collez une URL YouTube ou uploadez un fichier audio

4. Pour voter:
   - Utilisez les boutons pouce haut/bas à côté de chaque morceau

5. Pour communiquer:
   - Utilisez l'onglet Chat dans le panneau de droite

## Résolution des problèmes rapide

- **L'application ne démarre pas**: Vérifiez que vous êtes dans le bon dossier et que toutes les dépendances sont installées
- **Page blanche**: Vérifiez la console du navigateur (F12) pour voir les erreurs
- **Vidéos YouTube ne se chargent pas**: Vérifiez votre connexion Internet

## Arrêter l'application

Pour arrêter l'application, appuyez sur `Ctrl+C` dans le terminal où elle est en cours d'exécution.
