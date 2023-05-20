export const metadata = {
  title: "mmd-js demo",
  description: "A bare-bones demo of mmd-js in the browser",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
