import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { users } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur par email
    const user = await db.select().from(users).where(eq(users.email, email)).get();

    // Vérifier si l'utilisateur existe
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    // Note: Dans une application réelle, nous utiliserions bcrypt pour comparer les mots de passe hachés
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
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
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
