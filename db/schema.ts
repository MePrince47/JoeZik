import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// Définition des tables
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatarUrl: text('avatar_url').notNull(),
  points: integer('points').notNull().default(0),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  likedTracks: text('liked_tracks').notNull().default('[]') // Stocké comme JSON
});

export const playlists = sqliteTable('playlists', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull()
});

export const tracks = sqliteTable('tracks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  coverUrl: text('cover_url').notNull(),
  duration: integer('duration').notNull(),
  source: text('source').notNull(), // 'youtube' ou 'upload'
  sourceUrl: text('source_url').notNull(),
  playlistId: text('playlist_id').notNull().references(() => playlists.id),
  addedById: text('added_by_id').notNull().references(() => users.id),
  addedBy: text('added_by').notNull(),
  voteScore: integer('vote_score').notNull().default(0),
  addedAt: text('added_at').notNull()
});

export const trackVotes = sqliteTable('track_votes', {
  id: text('id').primaryKey(),
  trackId: text('track_id').notNull().references(() => tracks.id),
  userId: text('user_id').notNull().references(() => users.id),
  votedAt: text('voted_at').notNull()
}, (table) => {
  return {
    trackUserUnique: primaryKey({ columns: [table.trackId, table.userId] })
  };
});

export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  username: text('username').notNull(),
  userAvatar: text('user_avatar').notNull(),
  content: text('content').notNull(),
  timestamp: text('timestamp').notNull()
});

export const audioFiles = sqliteTable('audio_files', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  size: integer('size').notNull(),
  lastModified: integer('last_modified').notNull(),
  filePath: text('file_path').notNull(),
  uploadedAt: text('uploaded_at').notNull(),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id)
});
