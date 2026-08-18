import type { Metadata } from "next";
import "../../public/assets/css/bootstrap.min.css";
import "../../public/assets/css/bootstrap-icons.css";
import "../../public/assets/css/animate.min.css";
import "../../public/assets/css/swiper-bundle.min.css";
import "react-modal-video/css/modal-video.css";
import "../../public/assets/css/nice-select.css";
import "../../public/assets/css/style.css";
import { dmsans, manrope } from "../fonts/font";
import ClientRoot from "@/components/ClientRoot";
import ChunkErrorBoundary from "@/components/ChunkErrorBoundary";
import KavakalatPreloader from "@/components/common/KavakalatPreloader";

const siteUrl = "https://kavalakat.com";
const siteTitle = "Kavalakat - Factory & Industry Website.";
const siteDescription =
  "Kavalakat delivers reliable factory and industrial solutions, from manufacturing support to end-to-end project execution.";
const ogImage = "/assets/new-images/og-image.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: "/assets/new-images/fav-1.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Kavalakat",
    title: siteTitle,
    description: siteDescription,
    locale: "en_US",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Kavalakat - Factory & Industry Website",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`tt-magic-cursor ${dmsans.variable} ${manrope.variable}`}
      lang="en"
    >
      <body>
        <ChunkErrorBoundary>
          <ClientRoot>
            <KavakalatPreloader />
            {children}
          </ClientRoot>
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}