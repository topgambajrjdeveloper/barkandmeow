import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { UserProvider } from "@/contexts/UserContext";
import { Header } from "@/components/(root)/ui/header";
import { MobileNavigation } from "@/components/(root)/ui/MobileNavigation";
import Footer from "@/components/(root)/ui/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { PWAInstallPrompt } from "@/components/(root)/pwa-install-prompt";
import AnalyticsTracker from "@/components/(admin)/analytics/(client)/analytics-tracker";
import Analytics from "@/components/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BarkAndMeow - Red Social para Mascotas",
    template: "%s | BarkAndMeow",
  },
  description:
    "Conecta con otros dueños de mascotas, comparte momentos especiales y encuentra servicios para tus compañeros peludos.",
  keywords: [
    "mascotas",
    "perros",
    "gatos",
    "red social",
    "cuidado de mascotas",
    "veterinarios",
    "Red social para mascotas",
    "Comunidad para dueños de perros",
    "Aplicación para amantes de los animales",
    "Conectar con dueños de gatos",
    "Servicios pet-friendly cerca de mí",
  ],
  authors: [{ name: "BarkAndMeow Team" }],
  creator: "BarkAndMeow",
  publisher: "BarkAndMeow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://barkandmeow.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BarkAndMeow - Red Social para Mascotas",
    description:
      "Conecta con otros dueños de mascotas, comparte momentos especiales y encuentra servicios para tus compañeros peludos.",
    url: "https://barkandmeow.app",
    siteName: "BarkAndMeow",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BarkAndMeow - Red Social para Mascotas",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BarkAndMeow - Red Social para Mascotas",
    description:
      "Conecta con otros dueños de mascotas, comparte momentos especiales y encuentra servicios para tus compañeros peludos.",
    images: ["/twitter-image.jpg"],
    creator: "@BarkandmeowApp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#5bbad5",
      },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    google: `${process.env.VERIFICATION_GOOGLE_PROPERTY}`,
  },
  category: "social",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <UserProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  <div className="container max-w-custom mx-auto px-4 py-8">
                    {children}
                    <CookieConsent />
                  </div>
                </main>
                <MobileNavigation />
                <Footer />
              </div>
              <PWAInstallPrompt />
              <AnalyticsTracker />
              <Analytics />
            </ThemeProvider>
          </UserProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
