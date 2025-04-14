import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { users } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const avatar = formData.get('avatar') as File | null;

    // Vérifier si tous les champs requis sont fournis
    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si les mots de passe correspondent
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Les mots de passe ne correspondent pas' },
        { status: 400 }
      );
    }

    // Vérifier si l'email est déjà utilisé
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Générer un avatar par défaut si aucun n'est fourni
    let avatarUrl = `https://i.pravatar.cc/150?u=${email}`;

    // Si un avatar est fourni, le sauvegarder
    if (avatar) {
      try {
        const bytes = await avatar.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Créer le dossier de profils s'il n'existe pas
        const uploadDir = path.join(process.cwd(), 'public/uploads/profiles');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Générer un nom de fichier unique
        const fileName = `${uuidv4()}-${avatar.name}`;
        const filePath = path.join(uploadDir, fileName);

        // Écrire le fichier
        fs.writeFileSync(filePath, buffer);

        // Mettre à jour l'URL de l'avatar
        avatarUrl = `/uploads/profiles/${fileName}`;
      } catch (error) {
        console.error('Erreur lors du téléchargement de l\'avatar:', error);
      }
    }

    // Créer le nouvel utilisateur
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password, // Dans une vraie application, nous hasherions le mot de passe
      avatarUrl,
      points: 0,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      likedTracks: '[]'
    };

    // Insérer l'utilisateur dans la base de données
    await db.insert(users).values(newUser);

    // Créer le profil utilisateur (sans le mot de passe)
    const userProfile = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl,
      points: newUser.points,
      isAdmin: newUser.isAdmin,
      createdAt: newUser.createdAt
    };

    // Retourner le profil utilisateur
    return NextResponse.json(userProfile, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement' },
      { status: 500 }
    );
  }
}
