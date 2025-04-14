#!/usr/bin/env node

// Script pour initialiser la base de données SQLite
import { initDatabase } from '../db/index.js';

// Initialiser la base de données
initDatabase();

console.log('Base de données initialisée avec succès');
