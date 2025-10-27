import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../../context/theme-provider";
import SessionProviderWrapper from "@/features/core/lib/session-provider";
import { quicksand } from "@/fonts/quicksand";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "Go Gadi",
  description: "Whether it's a quick drive around the city or a weekend getaway, we've got the perfect ride for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${quicksand.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProviderWrapper>
            {children}
            <Toaster />
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
