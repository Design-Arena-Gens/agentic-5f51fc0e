import './globals.css';

export const metadata = {
  title: 'URL Metadata Preview',
  description: 'Fetch and preview metadata for any URL',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <h1>URL Metadata Preview</h1>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">Built for quick link introspection</div>
        </footer>
      </body>
    </html>
  );
}
