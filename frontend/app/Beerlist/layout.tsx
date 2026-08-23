// app/layout.tsx

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <a href="/" className="logo">
            HUSTED
          </a>

          <div className="nav-links">
            <a href="/">Home</a>
            <a href="/brewers">Data</a>
            <a href="/admin">Admin</a>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}