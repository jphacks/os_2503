"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { postMockCrackReport } from "@/lib/api"; // 仮のAPI
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { FaCamera, FaEgg } from "react-icons/fa";
import Webcam from "react-webcam";

export default function CameraPage() {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<GeolocationPosition | null>(
    null,
  );
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 撮影ボタンが押された時の処理
   */
  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) {
      setError("カメラが利用できません。");
      return;
    }

    // 写真を撮影して状態に保存
    const image = webcamRef.current.getScreenshot();
    setImageSrc(image);

    // 位置情報を取得して状態に保存
    try {
      const location = await getCurrentLocation();
      setLocationData(location);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? `位置情報の取得に失敗しました: ${err.message}`
          : "位置情報の取得に失敗しました。",
      );
    }
  }, [webcamRef]);

  /**
   * 送信(POST)ボタンが押された時の処理
   */
  const handleSubmit = async () => {
    // 送信前の検証
    if (!imageSrc) {
      setError("写真がありません。");
      return;
    }
    if (!locationData) {
      setError("位置情報が取得できていません。");
      return;
    }

    setIsSending(true);

    try {
      // 仮のAPIを呼び出す
      const response = await postMockCrackReport(imageSrc, locationData);
      console.log("API success:", response);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? `送信に失敗しました: ${err.message}`
          : "送信に失敗しました。",
      );
    } finally {
      setIsSending(false);
    }
  };

  /**
   * 撮り直しボタン
   */
  const resetCapture = () => {
    setImageSrc(null);
    setError(null);
  };

  return (
    <div className="h-svh w-screen overflow-hidden bg-black">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: "environment",
        }}
        className="h-full w-full object-contain"
      />
      <Button
        onClick={handleCapture}
        variant="ghost"
        className="absolute bottom-16 left-1/2 -translate-x-1/2"
        disabled={isSending || imageSrc !== null}
      >
        <FaEgg
          color="#FFFFFF"
          className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2"
        />
        <FaCamera
          color="#000000"
          className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2"
        />
      </Button>

      <Dialog open={imageSrc !== null} onOpenChange={resetCapture}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>写真を送信しますか？</DialogTitle>
          </DialogHeader>
          {imageSrc && (
            <Image
              src={imageSrc}
              alt="Captured"
              width={400}
              height={300}
              className="mx-auto"
            />
          )}

          <DialogFooter className="flex flex-row">
            <DialogClose asChild>
              <Button
                variant="secondary"
                onClick={resetCapture}
                disabled={isSending}
                className="grow"
              >
                撮り直す
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={isSending}
              className="grow"
            >
              {isSending ? "送信中..." : "送信する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getCurrentLocation() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("お使いのブラウザは位置情報に対応していません。"));
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}
