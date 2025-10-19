"use client";

import CameraComponent from "@/components/camera";
import { useRef } from "react";

import { IoIosRadioButtonOn } from "react-icons/io";

export default function Parent() {
  // 子のメソッドを呼び出すためのref
  const cameraRef = useRef<{ capture: () => string }>(null);

  const handleCapture = () => {
    if (cameraRef.current) {
      const data = cameraRef.current.capture(); // ← 子のメソッド呼び出し
      console.log("撮影データ:", data);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <CameraComponent ref={cameraRef} width={720} height={1280} />
      <button onClick={handleCapture} className="fixed bottom-0 z-10">
        <IoIosRadioButtonOn size={80} color={"#ffffff"} />
      </button>
    </div>
  );
}
