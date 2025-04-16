// Script de migration pour ajouter la colonne is_local_only à la table tracks
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier de base de données
const dbPath = path.resolve(__dirname, '..', 'sqlite.db');

// Fonction pour exécuter la migration
export const runMigration = async () => {
  try {
    console.log('Début de la migration: ajout de la colonne is_local_only à la table tracks');
    
    // Créer une connexion directe à la base de données
    const sqlite = new Database(dbPath);
    
    // Vérifier si la colonne existe déjà
    const tableInfo = sqlite.prepare('PRAGMA table_info(tracks)').all();
    const columnExists = tableInfo.some(column => column.name === 'is_local_only');
    
    if (!columnExists) {
      // Ajouter la colonne is_local_only
      sqlite.exec('ALTER TABLE tracks ADD COLUMN is_local_only INTEGER NOT NULL DEFAULT 0');
      console.log('Colonne is_local_only ajoutée avec succès');
    } else {
      console.log('La colonne is_local_only existe déjà');
    }
    
    // Fermer la connexion
    sqlite.close();
    
    console.log('Migration terminée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    return false;
  }
};

// Exécuter la migration si ce fichier est exécuté directement
if (process.argv[1] === import.meta.url) {
  runMigration()
    .then(success => {
      if (success) {
        console.log('Migration exécutée avec succès');
        process.exit(0);
      } else {
        console.error('Échec de la migration');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Erreur inattendue:', error);
      process.exit(1);
    });
}
