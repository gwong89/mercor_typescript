import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mercor",
  description: "Mercor Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-gray-200 bg-white">
            <div className="h-full px-4 flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Mercor</h1>
              </div>
            </div>
          </header>
          
          {/* Main Content with Sidebar */}
          <div className="flex flex-1">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-200 bg-white">
              <nav className="h-full p-4">
                <ul className="space-y-2">
                  <li>
                    <a href="/" className="block px-4 py-2 rounded-md hover:bg-gray-100 text-gray-900">
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="/submissions" className="block px-4 py-2 rounded-md hover:bg-gray-100 text-gray-900">
                      Submissions
                    </a>
                  </li>
                  <li>
                    <a href="/submissions/filters" className="block px-4 py-2 rounded-md hover:bg-gray-100 text-gray-900">
                      Filters
                    </a>
                  </li>
                </ul>
              </nav>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 p-8 bg-gray-50">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
