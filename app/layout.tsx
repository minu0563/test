import type { Metadata } from "next";
import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={` h-full antialiased`}
    >
      <body className="min-h-full flex flex-row">
        <div className="w-1/5 p-4 border-r border-gray-300">
          <p className="text-4xl font-bold">test</p>

          <div>
            <p className="mt-7 p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">새 채팅</p>

            <div className="p-2 mt-5 font-bold">
              <p>최근 채팅</p>
          </div>
          </div>
        </div>
        <div className="flex-1 p-4 relative">
          {children}
        </div>
      </body>
    </html>
  );
}
