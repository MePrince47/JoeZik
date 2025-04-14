import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { users } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

// GET /api/users/[id] - Récupérer un utilisateur par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    
    // Récupérer l'utilisateur
    const user = await db.select().from(users).where(eq(users.id, id)).get();
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Créer le profil utilisateur (sans le mot de passe)
    const userProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      points: user.points,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    };
    
    // Retourner le profil utilisateur
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Mettre à jour un utilisateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    const updates = await request.json();
    
    // Récupérer l'utilisateur
    const user = await db.select().from(users).where(eq(users.id, id)).get();
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Supprimer les champs sensibles des mises à jour
    delete updates.password;
    delete updates.id;
    delete updates.email; // Pour éviter les conflits d'email
    
    // Mettre à jour l'utilisateur
    await db.update(users)
      .set(updates)
      .where(eq(users.id, id));
    
    // Récupérer l'utilisateur mis à jour
    const updatedUser = await db.select().from(users).where(eq(users.id, id)).get();
    
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
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}
