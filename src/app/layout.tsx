import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ClientShell } from "@/components/navigation/ClientShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "HAIR BANDS | Premium Wigs & Hair Care",
  description: "Luxury authentic human hair wigs, extensions and styling services.",
};

export const viewport: Viewport = {
  themeColor: '#2D1B14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${pinyon.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-luxury-cream text-luxury-espresso font-sans">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ClientShell>
                {children}
              </ClientShell>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
