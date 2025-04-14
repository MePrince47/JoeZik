import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { playlists } from '../../../../db/schema';
import { v4 as uuidv4 } from 'uuid';

// GET /api/playlists - Récupérer toutes les playlists
export async function GET() {
  try {
    const allPlaylists = await db.select().from(playlists);
    return NextResponse.json(allPlaylists);
  } catch (error) {
    console.error('Erreur lors de la récupération des playlists:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des playlists' },
      { status: 500 }
    );
  }
}

// POST /api/playlists - Créer une nouvelle playlist
export async function POST(request: NextRequest) {
  try {
    const { title, description, imageUrl, ownerId, isPublic } = await request.json();
    
    // Vérifier si tous les champs requis sont fournis
    if (!title || !description || !imageUrl || !ownerId) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    
    // Créer la nouvelle playlist
    const newPlaylist = {
      id: uuidv4(),
      title,
      description,
      imageUrl,
      ownerId,
      isPublic: isPublic ?? true,
      createdAt: new Date().toISOString()
    };
    
    // Insérer la playlist dans la base de données
    await db.insert(playlists).values(newPlaylist);
    
    // Retourner la nouvelle playlist
    return NextResponse.json(newPlaylist, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la playlist:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la playlist' },
      { status: 500 }
    );
  }
}
