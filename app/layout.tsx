import { Providers } from "@/components/Providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 📌 MUST: VIEWPORT META TAG */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>

      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
