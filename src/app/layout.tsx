import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from '@/context/language-context';

export const metadata: Metadata = {
  title: 'RECOLIXO',
  description: 'Streamlined garbage collection for service providers and clients.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"></link>
        
        {/* Added CDN links for maplibre-gl-directions */}
        <link rel="stylesheet" href="https://unpkg.com/@maplibre/maplibre-gl-directions@0.6.0/dist/maplibre-gl-directions.css" />
        <script src="https://unpkg.com/@maplibre/maplibre-gl-directions@0.6.0/dist/maplibre-gl-directions.js"></script>
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
