import {
  forwardRef,
  ForwardRefRenderFunction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

interface Props {
  width: number;
  height: number;
}

export interface WebcamHandles {
  capture: () => string | null;
}

const Webcam: ForwardRefRenderFunction<WebcamHandles, Props> = (
  { width, height },
  ref,
) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // 親コンポーネントからref経由で実行できるメソッドを定義
  useImperativeHandle(ref, () => ({
    // video要素で表示している画像のdataURLを返すメソッド
    capture() {
      const canvas = document.createElement("canvas");
      if (videoRef === null || videoRef.current === null) {
        return null;
      }
      const { videoWidth, videoHeight } = videoRef.current;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const context = canvas.getContext("2d");
      if (context === null || videoRef.current === null) {
        return null;
      }
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg");
    },
  }));

  // カメラのstreamを取得して返すメソッド
  const getStream = useCallback(async () => {
    // モバイルデバイスが縦向きの場合はアスペクト比を縦横入れ替えて指定する
    const aspectRatio = height / width;
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: {
          ideal: 720,
        },
        height: {
          ideal: 1280,
        },
        aspectRatio,
      },
      audio: false,
    });
  }, [width, height]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const video = videoRef.current;

    // 取得したstreamをvideo要素に流す
    const setVideo = async () => {
      const newStream = await getStream();
      if (!video || !newStream) return;

      // すでに再生中のストリームがあれば停止
      if (video.srcObject) {
        (video.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }

      // 新しいストリームを設定
      video.srcObject = newStream;
      stream = newStream; // ← ここ重要（cleanupで停止するため）

      // play() は try-catch で安全に
      try {
        await video.play();
      } catch (err) {
        console.warn("play() が中断されました:", err);
      }
    };

    setVideo();

    // ✅ ページ離脱（ブラウザバック含む）時の停止処理
    const handleUnload = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (video) {
        video.srcObject = null;
      }
    };

    window.addEventListener("pagehide", handleUnload);
    window.addEventListener("beforeunload", handleUnload);

    // ✅ useEffectのcleanup
    return () => {
      handleUnload();
      window.removeEventListener("pagehide", handleUnload);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [getStream]);

  return <video ref={videoRef} playsInline width={width} height={height} />;
};

export default forwardRef(Webcam);
