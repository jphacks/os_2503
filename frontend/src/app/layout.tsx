import "@/app/globals.css";
import { jaJP } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";

// Google Fonts から Zen Maru Gothic を読み込み
const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"], // 利用したい太さ
  variable: "--font-zen-maru-gothic",
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
    <ClerkProvider
      //  localization={jaJP}
      localization={{
        ...jaJP,
        userProfile: {
          ...jaJP.userProfile,
          deletePage: {
            title: "アカウントの削除",
            messageLine1: "アカウントを削除してもよろしいですか？",
            messageLine2: "この操作は永久的で取り消すことはできません。",
            actionDescription:
              "続行するには「アカウント削除」と入力してください。",
            confirm: "削除",
          },
        },
      }}
    >
      <html lang="ja">
        <body
          className={`${zenMaruGothic.className} "bg-[#fdffce] antialiased"`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
