import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { users, playlists, tracks, trackVotes, chatMessages, audioFiles } from '../../../../db/schema';
import { v4 as uuidv4 } from 'uuid';

// POST /api/migrate - Migrer les données de localStorage vers SQLite
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { users: usersData, playlists: playlistsData, tracks: tracksData, chatMessages: chatMessagesData, audioFiles: audioFilesData } = data;
    
    // Migrer les utilisateurs
    if (usersData && Array.isArray(usersData)) {
      for (const user of usersData) {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await db.select().from(users).where(eq(users.id, user.id)).get();
        
        if (!existingUser) {
          // Insérer l'utilisateur
          await db.insert(users).values({
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            avatarUrl: user.avatarUrl,
            points: user.points,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
            likedTracks: JSON.stringify(user.likedTracks || [])
          });
        }
      }
    }
    
    // Migrer les playlists
    if (playlistsData && Array.isArray(playlistsData)) {
      for (const playlist of playlistsData) {
        // Vérifier si la playlist existe déjà
        const existingPlaylist = await db.select().from(playlists).where(eq(playlists.id, playlist.id)).get();
        
        if (!existingPlaylist) {
          // Insérer la playlist
          await db.insert(playlists).values({
            id: playlist.id,
            title: playlist.title,
            description: playlist.description,
            imageUrl: playlist.imageUrl,
            ownerId: playlist.ownerId,
            isPublic: playlist.isPublic,
            createdAt: playlist.createdAt
          });
        }
      }
    }
    
    // Migrer les pistes
    if (tracksData && Array.isArray(tracksData)) {
      for (const track of tracksData) {
        // Vérifier si la piste existe déjà
        const existingTrack = await db.select().from(tracks).where(eq(tracks.id, track.id)).get();
        
        if (!existingTrack) {
          // Insérer la piste
          await db.insert(tracks).values({
            id: track.id,
            title: track.title,
            artist: track.artist,
            coverUrl: track.coverUrl,
            duration: track.duration,
            source: track.source,
            sourceUrl: track.sourceUrl,
            playlistId: track.playlistId,
            addedById: track.addedById,
            addedBy: track.addedBy,
            voteScore: track.voteScore,
            addedAt: track.addedAt
          });
          
          // Migrer les votes pour cette piste
          if (track.votedBy && Array.isArray(track.votedBy)) {
            for (const userId of track.votedBy) {
              await db.insert(trackVotes).values({
                id: uuidv4(),
                trackId: track.id,
                userId,
                votedAt: new Date().toISOString()
              });
            }
          }
        }
      }
    }
    
    // Migrer les messages de chat
    if (chatMessagesData && Array.isArray(chatMessagesData)) {
      for (const message of chatMessagesData) {
        // Vérifier si le message existe déjà
        const existingMessage = await db.select().from(chatMessages).where(eq(chatMessages.id, message.id)).get();
        
        if (!existingMessage) {
          // Insérer le message
          await db.insert(chatMessages).values({
            id: message.id,
            userId: message.userId,
            username: message.username,
            userAvatar: message.userAvatar,
            content: message.content,
            timestamp: message.timestamp
          });
        }
      }
    }
    
    // Migrer les fichiers audio
    if (audioFilesData && Array.isArray(audioFilesData)) {
      for (const file of audioFilesData) {
        // Vérifier si le fichier existe déjà
        const existingFile = await db.select().from(audioFiles).where(eq(audioFiles.id, file.id)).get();
        
        if (!existingFile) {
          // Insérer le fichier
          await db.insert(audioFiles).values({
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            filePath: file.objectUrl, // Attention: les URLs d'objet ne fonctionneront pas après la migration
            uploadedAt: file.uploadedAt,
            uploadedBy: file.uploadedBy
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration réussie',
      counts: {
        users: usersData?.length || 0,
        playlists: playlistsData?.length || 0,
        tracks: tracksData?.length || 0,
        chatMessages: chatMessagesData?.length || 0,
        audioFiles: audioFilesData?.length || 0
      }
    });
  } catch (error) {
    console.error('Erreur lors de la migration des données:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la migration des données' },
      { status: 500 }
    );
  }
}

// Importation de l'opérateur eq
import { eq } from 'drizzle-orm';
