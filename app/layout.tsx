import './globals.css';
import { Header } from '../components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="app-surface min-h-screen">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </body>
    </html>
  );
}
