import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../db';
import { users, trackVotes } from '../../../../../../db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/users/[id]/likes - Vérifier si un utilisateur a aimé une piste
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await params.id;
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId');
    
    // Vérifier si l'ID de la piste est fourni
    if (!trackId) {
      // Si aucun trackId n'est fourni, retourner toutes les pistes aimées par l'utilisateur
      const user = await db.select().from(users).where(eq(users.id, userId)).get();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }
      
      // Récupérer tous les votes de l'utilisateur
      const votes = await db.select()
        .from(trackVotes)
        .where(eq(trackVotes.userId, userId));
      
      // Extraire les IDs des pistes
      const likedTrackIds = votes.map(vote => vote.trackId);
      
      return NextResponse.json({ likedTrackIds });
    }
    
    // Vérifier si l'utilisateur a aimé la piste
    const vote = await db.select()
      .from(trackVotes)
      .where(
        and(
          eq(trackVotes.userId, userId),
          eq(trackVotes.trackId, trackId)
        )
      )
      .get();
    
    return NextResponse.json({ liked: !!vote });
  } catch (error) {
    console.error('Erreur lors de la vérification des likes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des likes' },
      { status: 500 }
    );
  }
}
