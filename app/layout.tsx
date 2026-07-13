import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={` h-full antialiased `}
    >
      <body className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
