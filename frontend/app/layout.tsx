import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import "./beerlist/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <Link href="/beerlist" className="logo">
            <Image
              src="/beerlist/logo.png"
              alt="Husted logo"
              width={170}
              height={48}
              priority
            />
          </Link>

          <div className="nav-links">
            <Link href="/beerlist">Home</Link>
            <Link href="/beers">Data</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}