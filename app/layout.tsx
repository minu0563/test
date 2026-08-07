import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import Providers from "@/components/Providers";
import localFont from "next/font/local";

const font = localFont({
  src: [
    {
      path: "../fonts/NanumSquareRoundL_3_11zon.woff2",
      weight: "300",
    },
    {
      path: "../fonts/NanumSquareRoundR_4_11zon.woff2",
      weight: "400",
    },
    {
      path: "../fonts/NanumSquareRoundB_1_11zon.woff2",
      weight: "700",
    },
    {
      path: "../fonts/NanumSquareRoundEB_2_11zon.woff2",
      weight: "800",
    },
  ],
  variable: "--font-custom",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`h-full antialiased ${font.variable}`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const theme = localStorage.getItem("theme");

              if (theme === null) {
                localStorage.setItem("theme", "dark");
                document.documentElement.classList.add("dark");
              }
              else if (theme === "dark") {
                document.documentElement.classList.add("dark");
              } 
              else if (theme === "light") {
                document.documentElement.classList.remove("dark");
              } 
              else {
                document.documentElement.classList.add("dark");
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