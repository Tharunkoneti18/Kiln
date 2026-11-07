import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/caveat";
import "./globals.css";
import { ThemeProvider, themeBootstrapScript } from "@/components/shell/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Career OS",
    template: "%s · Career OS",
  },
  description:
    "Map the skills a role demands, prove them with real work, and track every step from first lesson to offer.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF9F7" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Fonts are self-hosted (next/font + fontsource): no third-party request
    // on first paint, and no layout shift while a remote stylesheet loads.
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
