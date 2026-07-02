import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Reimagined | 360° Image Gallery",
  description: "A 360° image competition gallery and viewer.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.css" />
      </head>
      <body className={inter.className}>
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.js" strategy="beforeInteractive" />
        <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
