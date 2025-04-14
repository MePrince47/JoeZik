import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../db';
import { tracks, trackVotes, users } from '../../../../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// POST /api/tracks/[id]/vote - Voter pour une piste
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = await params.id;
    const { userId } = await request.json();
    
    // Vérifier si l'ID utilisateur est fourni
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si la piste existe
    const track = await db.select().from(tracks).where(eq(tracks.id, trackId)).get();
    if (!track) {
      return NextResponse.json(
        { error: 'Piste non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'utilisateur existe
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'utilisateur a déjà voté pour cette piste
    const existingVote = await db.select()
      .from(trackVotes)
      .where(
        and(
          eq(trackVotes.trackId, trackId),
          eq(trackVotes.userId, userId)
        )
      )
      .get();
    
    if (existingVote) {
      // L'utilisateur a déjà voté, supprimer le vote
      await db.delete(trackVotes)
        .where(
          and(
            eq(trackVotes.trackId, trackId),
            eq(trackVotes.userId, userId)
          )
        );
      
      // Mettre à jour le score de la piste
      await db.update(tracks)
        .set({ voteScore: track.voteScore - 1 })
        .where(eq(tracks.id, trackId));
      
      // Mettre à jour les pistes aimées de l'utilisateur
      const likedTracks = JSON.parse(user.likedTracks);
      const updatedLikedTracks = likedTracks.filter((id: string) => id !== trackId);
      
      await db.update(users)
        .set({ likedTracks: JSON.stringify(updatedLikedTracks) })
        .where(eq(users.id, userId));
      
      // Récupérer la piste mise à jour
      const updatedTrack = await db.select().from(tracks).where(eq(tracks.id, trackId)).get();
      
      if (!updatedTrack) {
        return NextResponse.json(
          { error: 'Erreur lors de la récupération de la piste mise à jour' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        action: 'removed',
        voteScore: updatedTrack.voteScore
      });
    } else {
      // L'utilisateur n'a pas encore voté, ajouter le vote
      await db.insert(trackVotes).values({
        id: uuidv4(),
        trackId,
        userId,
        votedAt: new Date().toISOString()
      });
      
      // Mettre à jour le score de la piste
      await db.update(tracks)
        .set({ voteScore: track.voteScore + 1 })
        .where(eq(tracks.id, trackId));
      
      // Mettre à jour les pistes aimées de l'utilisateur
      const likedTracks = JSON.parse(user.likedTracks);
      likedTracks.push(trackId);
      
      await db.update(users)
        .set({ likedTracks: JSON.stringify(likedTracks) })
        .where(eq(users.id, userId));
      
      // Récupérer la piste mise à jour
      const updatedTrack = await db.select().from(tracks).where(eq(tracks.id, trackId)).get();
      
      if (!updatedTrack) {
        return NextResponse.json(
          { error: 'Erreur lors de la récupération de la piste mise à jour' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        action: 'added',
        voteScore: updatedTrack.voteScore
      });
    }
  } catch (error) {
    console.error('Erreur lors du vote pour la piste:', error);
    return NextResponse.json(
      { error: 'Erreur lors du vote pour la piste' },
      { status: 500 }
    );
  }
}
