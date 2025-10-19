import "@/app/globals.css";
import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import { FaCamera, FaHome } from "react-icons/fa";
import { FaLocationPin } from "react-icons/fa6";

import Link from "next/link";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // metadataBase: new URL("https://example.com"),

  title: "ひびコレ",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", rel: "icon", type: "image/svg+xml" },
      { url: "/favicon.ico", rel: "icon", type: "image/x-icon" },
      {
        url: "/favicon-16x16.png",
        rel: "icon",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        rel: "icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icon-192x192.png",
        rel: "icon",
      },
      {
        url: "/icon-512x512.png",
        rel: "icon",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "ひびコレ",
    description:
      "ひびコレは全国の交通インフラにおけるひびの画像を収集し，分布を可視化して改善に繋げるためのアプリです！",
    images: [
      {
        url: "/ogp/image.png",
        width: 500,
        height: 500,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="flex h-16 items-center justify-end gap-4 p-4">
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="text-ceramic-white h-10 cursor-pointer rounded-full bg-amber-400 px-4 text-sm font-medium sm:h-12 sm:px-5 sm:text-base">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      {children}
      <footer className="fixed bottom-0 flex h-20 w-full items-center justify-between overflow-visible bg-amber-400 px-8 shadow-inner shadow-black">
        <Button className="bg-transparent">
          <Link href="/">
            <FaHome size={48} color={"#000000"} />
          </Link>
        </Button>
        <Button className="egg-up -translate-y-8 bg-white">
          <FaCamera size={48} className="flex-none text-black" />
        </Button>
        <Button className="bg-transparent">
          <FaLocationPin size={48} color={"#000000"} />
        </Button>
      </footer>
    </>
  );
}
