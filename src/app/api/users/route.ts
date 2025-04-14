import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';

// GET /api/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    
    // Créer les profils utilisateurs (sans les mots de passe)
    const userProfiles = allUsers.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      points: user.points,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    }));
    
    return NextResponse.json(userProfiles);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}
