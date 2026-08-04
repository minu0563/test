import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const theme = localStorage.getItem("theme");

              if (theme === "dark") {
                document.documentElement.classList.add("dark");
              } 
              else if (theme === "light") {
                document.documentElement.classList.remove("dark");
              } 
              else {
                const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

                if (systemDark) {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.add("dark");
                }
              }
            } catch {}
          `}
        </Script>
      </head>

      <body className="min-h-screen bg-(--bg) text-(--text)">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}