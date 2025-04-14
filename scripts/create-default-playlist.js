#!/usr/bin/env node

import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

// Fonction pour créer la playlist par défaut
async function createDefaultPlaylist() {
  try {
    // Récupérer les utilisateurs
    const usersResponse = await fetch('http://localhost:3000/api/users');
    const users = await usersResponse.json();
    
    // Utiliser le premier utilisateur comme propriétaire de la playlist
    const ownerId = users.length > 0 ? users[0].id : uuidv4();
    
    // Créer la playlist par défaut
    const playlistResponse = await fetch('http://localhost:3000/api/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 'default-playlist',
        title: 'Playlist par défaut',
        description: 'Playlist par défaut de Joezik',
        imageUrl: 'https://i.scdn.co/image/ab67616d0000b273b04da49dd710937f6a57f23c',
        ownerId,
        isPublic: true
      })
    });
    
    if (playlistResponse.ok) {
      const playlist = await playlistResponse.json();
      console.log('Playlist par défaut créée avec succès:', playlist);
    } else {
      console.error('Erreur lors de la création de la playlist par défaut:', await playlistResponse.text());
    }
  } catch (error) {
    console.error('Erreur lors de la création de la playlist par défaut:', error);
  }
}

// Exécuter la fonction
createDefaultPlaylist();
