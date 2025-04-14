import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../../db';
import { users } from '../../../../../../db/schema';
import { eq } from 'drizzle-orm';

// POST /api/users/[id]/points - Ajouter des points à un utilisateur
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await params.id;
    const { points } = await request.json();
    
    // Vérifier si les points sont fournis
    if (points === undefined || typeof points !== 'number') {
      return NextResponse.json(
        { error: 'Points requis (nombre)' },
        { status: 400 }
      );
    }
    
    // Récupérer l'utilisateur
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Calculer les nouveaux points
    const newPoints = user.points + points;
    
    // Mettre à jour les points de l'utilisateur
    await db.update(users)
      .set({ points: newPoints })
      .where(eq(users.id, userId));
    
    // Récupérer l'utilisateur mis à jour
    const updatedUser = await db.select().from(users).where(eq(users.id, userId)).get();
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'utilisateur mis à jour' },
        { status: 500 }
      );
    }
    
    // Créer le profil utilisateur mis à jour (sans le mot de passe)
    const updatedUserProfile = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      points: updatedUser.points,
      isAdmin: updatedUser.isAdmin,
      createdAt: updatedUser.createdAt
    };
    
    // Retourner le profil utilisateur mis à jour
    return NextResponse.json(updatedUserProfile);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de points:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de points' },
      { status: 500 }
    );
  }
}
