import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { tracks, trackVotes } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

// GET /api/tracks/[id] - Récupérer une piste par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    
    // Récupérer la piste
    const track = await db.select().from(tracks).where(eq(tracks.id, id)).get();
    
    // Vérifier si la piste existe
    if (!track) {
      return NextResponse.json(
        { error: 'Piste non trouvée' },
        { status: 404 }
      );
    }
    
    // Retourner la piste
    return NextResponse.json(track);
  } catch (error) {
    console.error('Erreur lors de la récupération de la piste:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la piste' },
      { status: 500 }
    );
  }
}

// PATCH /api/tracks/[id] - Mettre à jour une piste
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    const updates = await request.json();
    
    // Récupérer la piste
    const track = await db.select().from(tracks).where(eq(tracks.id, id)).get();
    
    // Vérifier si la piste existe
    if (!track) {
      return NextResponse.json(
        { error: 'Piste non trouvée' },
        { status: 404 }
      );
    }
    
    // Mettre à jour la piste
    await db.update(tracks)
      .set(updates)
      .where(eq(tracks.id, id));
    
    // Récupérer la piste mise à jour
    const updatedTrack = await db.select().from(tracks).where(eq(tracks.id, id)).get();
    
    // Retourner la piste mise à jour
    return NextResponse.json(updatedTrack);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la piste:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la piste' },
      { status: 500 }
    );
  }
}

// DELETE /api/tracks/[id] - Supprimer une piste
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    
    // Récupérer la piste
    const track = await db.select().from(tracks).where(eq(tracks.id, id)).get();
    
    // Vérifier si la piste existe
    if (!track) {
      return NextResponse.json(
        { error: 'Piste non trouvée' },
        { status: 404 }
      );
    }
    
    // Supprimer tous les votes pour cette piste
    await db.delete(trackVotes).where(eq(trackVotes.trackId, id));
    
    // Supprimer la piste
    await db.delete(tracks).where(eq(tracks.id, id));
    
    // Retourner un message de succès
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la piste:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la piste' },
      { status: 500 }
    );
  }
}
