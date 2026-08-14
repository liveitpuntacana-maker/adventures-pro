/**
 * Root layout for Sanity Studio.
 *
 * The Studio ships its own styling and must not inherit the site shell or the
 * global stylesheet, so it gets a bare document of its own.
 */
export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
