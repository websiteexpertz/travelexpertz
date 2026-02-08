import type { Metadata } from "next";
import "../src/styles/globals.css";
import "../src/styles/modern.css";
import RootLayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "TravelExpertz - Travel & Hotel Booking",
  description: "Your ultimate travel booking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ margin: 0, padding: 0 }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          crossOrigin=""
          href="https://fonts.gstatic.com"
          rel="preconnect"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
          }
        `}</style>
      </head>
      <body
        className="bg-background-light font-display text-slate-800"
        style={{ margin: 0, padding: 0, paddingTop: "64px" }}
      >
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
