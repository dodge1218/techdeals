import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TechDeals - Best Tech Deals & Reviews',
  description: 'Find the best deals on crypto miners, PC parts, phones, and gaming gear',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b">
            <nav className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <a href="/" className="text-2xl font-bold text-primary">
                  TechDeals
                </a>
                <div className="flex gap-6">
                  <a href="/categories" className="hover:text-primary">
                    Categories
                  </a>
                  <a href="/articles" className="hover:text-primary">
                    Articles
                  </a>
                  <a href="/trends" className="hover:text-primary">
                    Trends
                  </a>
                  <a href="/admin" className="hover:text-primary">
                    Admin
                  </a>
                </div>
              </div>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t mt-12">
            <div className="container mx-auto px-4 py-8">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Affiliate Disclosure:</strong> TechDeals is a participant in various
                  affiliate programs including Amazon Associates, Best Buy Affiliate Program, and
                  Newegg Affiliate Program. We earn commissions from qualifying purchases made
                  through affiliate links on this site.
                </p>
                <p>
                  Prices and availability are accurate as of the date/time indicated and are
                  subject to change. Any price and availability information displayed on merchant
                  sites at the time of purchase will apply to the purchase of this product.
                </p>
                <p className="mt-4">
                  © {new Date().getFullYear()} TechDeals. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
