import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "JoeZik - Playlist Collaborative",
  description: "Écoutez de la musique ensemble et créez des playlists collaboratives",
  keywords: "musique, playlist, collaborative, jeu, social",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <div className="jz-main-layout">
          {children}
        </div>
      </body>
    </html>
  );
}
