import "@/styles/globals.css";
import { cal, inter } from "@/styles/fonts";
import { Providers } from "./providers";
import { Metadata } from "next";
import { cn } from "@/lib/utils";

const title = "Revisions - changelogs";
const description =
  "Revisions is a platform for creating and sharing changelogs for your projects/packages. It's free to get started.";
const image = "https://revisions-images.s3.amazonaws.com/logo-full.png";

export const metadata: Metadata = {
  title,
  description,
  icons: ["https://revisions-images.s3.amazonaws.com/favicon.ico"],
  openGraph: {
    title,
    description,
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
    creator: "@AmanDesai05",
  },
  metadataBase: new URL("https://revisions.tech"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(cal.variable, inter.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
