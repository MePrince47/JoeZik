import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { tracks } from '../../../../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

// GET /api/tracks - Récupérer toutes les pistes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('playlistId');
    const sortBy = searchParams.get('sortBy') || 'votes'; // 'votes' ou 'date'
    
    let allTracks;
    
    if (playlistId) {
      // Récupérer les pistes d'une playlist spécifique
      allTracks = await db.select().from(tracks).where(eq(tracks.playlistId, playlistId));
    } else {
      // Récupérer toutes les pistes
      allTracks = await db.select().from(tracks);
    }
    
    // Trier les pistes selon le critère spécifié
    if (sortBy === 'date') {
      // Tri par date d'ajout (du plus récent au plus ancien)
      allTracks.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    } else {
      // Tri par nombre de votes (par défaut)
      allTracks.sort((a, b) => b.voteScore - a.voteScore);
    }
    
    return NextResponse.json(allTracks);
  } catch (error) {
    console.error('Erreur lors de la récupération des pistes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pistes' },
      { status: 500 }
    );
  }
}

// POST /api/tracks - Créer une nouvelle piste
export async function POST(request: NextRequest) {
  try {
    const {
      title,
      artist,
      coverUrl,
      duration,
      source,
      sourceUrl,
      playlistId,
      addedById,
      addedBy
    } = await request.json();
    
    // Vérifier si tous les champs requis sont fournis
    if (!title || !artist || !coverUrl || !duration || !source || !sourceUrl || !playlistId || !addedById || !addedBy) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    
    // Créer la nouvelle piste
    const newTrack = {
      id: uuidv4(),
      title,
      artist,
      coverUrl,
      duration,
      source,
      sourceUrl,
      playlistId,
      addedById,
      addedBy,
      voteScore: 0,
      addedAt: new Date().toISOString()
    };
    
    // Insérer la piste dans la base de données
    await db.insert(tracks).values(newTrack);
    
    // Retourner la nouvelle piste
    return NextResponse.json(newTrack, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la piste:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la piste' },
      { status: 500 }
    );
  }
}
