import "./globals.css";
import Image from "next/image";

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
            <Image
              src="/beerlist/logo.png"
              alt="Husted logo"
              width={250}
              height={250}
            />
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