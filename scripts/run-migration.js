// Script pour exécuter la migration add_is_local_only
import { runMigration } from '../db/migrations/add_is_local_only.js';

console.log('Exécution de la migration pour ajouter la colonne is_local_only...');

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
