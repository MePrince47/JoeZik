import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

// Chemin vers le fichier de base de données
const dbPath = path.resolve(process.cwd(), 'db/sqlite.db');

// Créer une connexion à la base de données
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Fonction pour exécuter les migrations
export const runMigrations = () => {
  try {
    migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'db/migrations') });
    console.log('Migrations exécutées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'exécution des migrations:', error);
  }
};

// Fonction pour initialiser la base de données
export const initDatabase = () => {
  try {
    // Créer les tables si elles n'existent pas déjà
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar_url TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        is_admin INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        liked_tracks TEXT NOT NULL DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        is_public INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS tracks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        cover_url TEXT NOT NULL,
        duration INTEGER NOT NULL,
        source TEXT NOT NULL,
        source_url TEXT NOT NULL,
        playlist_id TEXT NOT NULL,
        added_by_id TEXT NOT NULL,
        added_by TEXT NOT NULL,
        vote_score INTEGER NOT NULL DEFAULT 0,
        added_at TEXT NOT NULL,
        FOREIGN KEY (playlist_id) REFERENCES playlists (id),
        FOREIGN KEY (added_by_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS track_votes (
        id TEXT PRIMARY KEY,
        track_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        voted_at TEXT NOT NULL,
        FOREIGN KEY (track_id) REFERENCES tracks (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE (track_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        user_avatar TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS audio_files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        last_modified INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_at TEXT NOT NULL,
        uploaded_by TEXT NOT NULL,
        FOREIGN KEY (uploaded_by) REFERENCES users (id)
      );
    `);
    
    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
};
