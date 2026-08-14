import "../globals.css";

/**
 * Root layout for the embeddable widgets.
 *
 * The widgets are served inside an iframe on external sites, so they carry
 * their own <html> document and stay out of the localized site shell (no nav,
 * no footer, no analytics).
 */
export const metadata = {
  robots: { index: false, follow: false },
};

export default function WidgetLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-transparent">
        <div className="min-h-screen bg-transparent p-4 md:p-6">{children}</div>
      </body>
    </html>
  );
}
