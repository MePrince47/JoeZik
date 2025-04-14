import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { playlists, tracks } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

// GET /api/playlists/[id] - Récupérer une playlist par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    
    // Récupérer la playlist
    const playlist = await db.select().from(playlists).where(eq(playlists.id, id)).get();
    
    // Vérifier si la playlist existe
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist non trouvée' },
        { status: 404 }
      );
    }
    
    // Retourner la playlist
    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Erreur lors de la récupération de la playlist:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la playlist' },
      { status: 500 }
    );
  }
}

// PATCH /api/playlists/[id] - Mettre à jour une playlist
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    const updates = await request.json();
    
    // Récupérer la playlist
    const playlist = await db.select().from(playlists).where(eq(playlists.id, id)).get();
    
    // Vérifier si la playlist existe
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist non trouvée' },
        { status: 404 }
      );
    }
    
    // Mettre à jour la playlist
    await db.update(playlists)
      .set(updates)
      .where(eq(playlists.id, id));
    
    // Récupérer la playlist mise à jour
    const updatedPlaylist = await db.select().from(playlists).where(eq(playlists.id, id)).get();
    
    // Retourner la playlist mise à jour
    return NextResponse.json(updatedPlaylist);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la playlist:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la playlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists/[id] - Supprimer une playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    
    // Récupérer la playlist
    const playlist = await db.select().from(playlists).where(eq(playlists.id, id)).get();
    
    // Vérifier si la playlist existe
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist non trouvée' },
        { status: 404 }
      );
    }
    
    // Supprimer toutes les pistes de la playlist
    await db.delete(tracks).where(eq(tracks.playlistId, id));
    
    // Supprimer la playlist
    await db.delete(playlists).where(eq(playlists.id, id));
    
    // Retourner un message de succès
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la playlist:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la playlist' },
      { status: 500 }
    );
  }
}
