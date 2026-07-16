import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (  
    <html
      lang="en"
      suppressHydrationWarning
      className={` h-full antialiased `}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
          try {
            const theme = localStorage.getItem("theme");
            if (theme === "dark") {
              document.documentElement.classList.add("dark");
            }
          } catch {}
        `}
        </Script>
      </head>
      <body className="flex min-h-screen bg-(--bg) text-(--text)">
        <Sidebar />

        <main className="flex-1 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
