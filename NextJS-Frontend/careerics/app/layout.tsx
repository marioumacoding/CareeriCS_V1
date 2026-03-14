import type { Metadata } from "next";
import { Balsamiq_Sans, Jura, Nova_Square } from "next/font/google";
import { Providers } from "@/providers";
import "../styles/globals.scss"; 
import "../styles/mixins.scss"; 
import "../styles/variables.css"; 

const jura = Jura({
  subsets: ["latin"],
  variable: "--font-jura",
});

const novaSquare = Nova_Square({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-nova-square",
});

const balsamiqSans = Balsamiq_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roadmap-hand",
});

export const metadata: Metadata = {
  title: {
    default: "CareeriCS",
    template: "%s | CareeriCS",
  },
  description: "CareeriCS — your career in computer science starts here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jura.variable} ${novaSquare.variable} ${balsamiqSans.variable} antialiased`}
        style={{ backgroundColor: "var(--bg-color)" }}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
