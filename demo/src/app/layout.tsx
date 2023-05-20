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
      <body>
        {children}
        <footer style={{ display: "flex", gap: "0.5rem", marginTop: "-1rem" }}>
          <a href="https://npmjs.com/package/mmd-js">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://img.shields.io/npm/v/mmd-js?label=npm&logo=npm"
              alt="github version"
            />
          </a>
          <a href="https://github.com/anulman/mmd-js">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://img.shields.io/github/package-json/v/anulman/mmd-js/main?label=github&logo=github"
              alt="github version"
            />
          </a>
          <a href="https://twitter.com/intent/follow?screen_name=anulman">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://img.shields.io/twitter/follow/anulman?style=social&logo=twitter"
              alt="follow on Twitter"
            />
          </a>
        </footer>
      </body>
    </html>
  );
}
