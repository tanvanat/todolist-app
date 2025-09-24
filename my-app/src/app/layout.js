import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Todo List App",
  viewport: { width: "device-width", initialScale: 1 },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ตั้งธีมตั้งแต่เฟรมแรก (anti-FOUC) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var d = document.documentElement;
    var saved = localStorage.getItem('theme');
    var shouldDark = saved ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (shouldDark) d.classList.add('dark'); else d.classList.remove('dark');
  } catch (_) {}
})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
