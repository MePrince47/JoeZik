import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { chatMessages, users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// GET /api/chat - Récupérer les messages de chat
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    let allMessages;
    
    if (limit) {
      // Récupérer un nombre limité de messages
      const limitNum = parseInt(limit, 10);
      
      // Récupérer tous les messages et les trier par date
      const messages = await db.select().from(chatMessages);
      
      // Trier les messages par date (du plus récent au plus ancien)
      messages.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      // Prendre les N derniers messages
      allMessages = messages.slice(0, limitNum);
      
      // Inverser pour avoir les messages du plus ancien au plus récent
      allMessages.reverse();
    } else {
      // Récupérer tous les messages
      allMessages = await db.select().from(chatMessages);
      
      // Trier les messages par date (du plus ancien au plus récent)
      allMessages.sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
    }
    
    return NextResponse.json(allMessages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages de chat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages de chat' },
      { status: 500 }
    );
  }
}

// POST /api/chat - Créer un nouveau message de chat
export async function POST(request: NextRequest) {
  try {
    const { userId, content } = await request.json();
    
    // Vérifier si tous les champs requis sont fournis
    if (!userId || !content) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
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
    
    // Créer le nouveau message
    const newMessage = {
      id: uuidv4(),
      userId,
      username: user.username,
      userAvatar: user.avatarUrl,
      content,
      timestamp: new Date().toISOString()
    };
    
    // Insérer le message dans la base de données
    await db.insert(chatMessages).values(newMessage);
    
    // Retourner le nouveau message
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du message de chat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du message de chat' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat - Supprimer un message de chat
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    // Vérifier si tous les paramètres requis sont fournis
    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'ID du message et ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    // Récupérer le message
    const message = await db.select().from(chatMessages).where(eq(chatMessages.id, messageId)).get();
    
    // Vérifier si le message existe
    if (!message) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'utilisateur est l'auteur du message
    if (message.userId !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer ce message' },
        { status: 403 }
      );
    }
    
    // Supprimer le message
    await db.delete(chatMessages).where(eq(chatMessages.id, messageId));
    
    // Retourner un message de succès
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du message de chat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du message de chat' },
      { status: 500 }
    );
  }
}
