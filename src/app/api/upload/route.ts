import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { audioFiles, users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// POST /api/upload - Télécharger un fichier audio
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    // Vérifier si tous les champs requis sont fournis
    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Fichier et ID utilisateur requis' },
        { status: 400 }
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
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être un fichier audio' },
        { status: 400 }
      );
    }
    
    // Lire le contenu du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Créer le dossier d'upload s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'public/uploads/audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Générer un nom de fichier unique
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Écrire le fichier
    fs.writeFileSync(filePath, buffer);
    
    // Créer les métadonnées du fichier
    const fileMetadata = {
      id: uuidv4(),
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      filePath: `/uploads/audio/${fileName}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId
    };
    
    // Insérer les métadonnées dans la base de données
    await db.insert(audioFiles).values(fileMetadata);
    
    // Retourner les métadonnées du fichier
    return NextResponse.json(fileMetadata, { status: 201 });
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement du fichier' },
      { status: 500 }
    );
  }
}

// GET /api/upload - Récupérer les fichiers audio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const fileId = searchParams.get('id');
    
    // Récupérer un fichier audio par ID
    if (fileId) {
      const file = await db.select()
        .from(audioFiles)
        .where(eq(audioFiles.id, fileId))
        .get();
      
      if (!file) {
        return NextResponse.json(
          { error: 'Fichier audio non trouvé' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(file);
    }
    
    // Récupérer les fichiers audio d'un utilisateur
    if (userId) {
      const files = await db.select()
        .from(audioFiles)
        .where(eq(audioFiles.uploadedBy, userId));
      
      return NextResponse.json(files);
    }
    
    // Récupérer tous les fichiers audio
    const allFiles = await db.select().from(audioFiles);
    return NextResponse.json(allFiles);
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers audio:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fichiers audio' },
      { status: 500 }
    );
  }
}

// DELETE /api/upload - Supprimer un fichier audio
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'ID du fichier requis' },
        { status: 400 }
      );
    }
    
    // Récupérer le fichier audio
    const file = await db.select()
      .from(audioFiles)
      .where(eq(audioFiles.id, fileId))
      .get();
    
    if (!file) {
      return NextResponse.json(
        { error: 'Fichier audio non trouvé' },
        { status: 404 }
      );
    }
    
    // Supprimer le fichier du système de fichiers
    const filePath = path.join(process.cwd(), 'public', file.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Supprimer les métadonnées de la base de données
    await db.delete(audioFiles).where(eq(audioFiles.id, fileId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier audio:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du fichier audio' },
      { status: 500 }
    );
  }
}
