import type { Metadata } from "next";
import "./globals.css";
// import Navbar from "./components/Navbar";
import SeoJsonLd from "@/app/components/SeoJsonLd";
// export const metadata: Metadata = {
//   metadataBase: new URL("https://quran-global.vercel.app"), // change later to your real domain
//   title: {
//     default: "Qur’an Global — Preserving the Voices of Qur’anic Reciters",
//     template: "%s — Qur’an Global",
//   },
//   description:
//     "Discover, listen to, and download Qur’an recitations from African and underrepresented reciters.",
//   applicationName: "Qur’an Global",
//   keywords: [
//     "Quran recitation",
//     "Qur'an",
//     "reciters",
//     "African reciters",
//     "mp3",
//     "surahs",
//     "tilawah",
//   ],
//   alternates: {
//     canonical: "/",
//   },
//   openGraph: {
//     type: "website",
//     url: "/",
//     title: "Qur’an Global — Preserving the Voices of Qur’anic Reciters",
//     description:
//       "Discover, listen to, and download Qur’an recitations from African and underrepresented reciters.",
//     siteName: "Qur’an Global",
//     images: [
//       {
//         url: "/og.png", // create this image in /public
//         width: 1200,
//         height: 630,
//         alt: "Qur’an Global",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Qur’an Global",
//     description:
//       "Discover, listen to, and download Qur’an recitations from African and underrepresented reciters.",
//     images: ["/og.png"],
//   },
//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       "max-image-preview": "large",
//       "max-snippet": -1,
//       "max-video-preview": -1,
//     },
//   },
//   icons: {
//     icon: "/favicon.ico",
//     apple: "/apple-touch-icon.png",
//   },
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* <Navbar /> */}
        { children }
        </body>
    </html>
  );
}

