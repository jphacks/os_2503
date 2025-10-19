"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoadingPage() {
  // #region 画面のチラつき対策 (ロード画面は読み込み時間が長い場合のみ表示する)
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 200); // 200ms以上かかったときだけ表示

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;
  // #endregion

  return (
    <div
      className="flex h-screen flex-col items-center justify-center"
      aria-label="Now Loading..."
    >
      <Image
        width={200}
        height={336}
        src="/egg_rolling.gif"
        alt="Now Loading..."
        unoptimized
      />
      <p className="text-2xl">Now Loading...</p>
    </div>
  );
}
