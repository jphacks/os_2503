from typing import Union
from PIL import Image
import numpy as np
import os


def invert_and_transparent_black(
    img_input: Union[str, Image.Image, np.ndarray],
    threshold: int = 128,
    save_path: str = None,
) -> Image.Image:
    """
    白黒反転した画像を作成し、白部分を透過（黒部分のみ表示）する。

    Args:
        img_input: 画像パス (str) / PIL.Image / numpy.ndarray (H,W[,C])
        threshold: 反転後の閾値 (0〜255)。暗い部分を残す。
        save_path: 保存パス (例: 'out.png')。省略可。

    Returns:
        透過PNG (RGBA) の PIL.Image
    """

    # --- 入力をPIL.Imageに変換 ---
    if isinstance(img_input, str):
        img = Image.open(img_input).convert("L")
    elif isinstance(img_input, Image.Image):
        img = img_input.convert("L")
    elif isinstance(img_input, np.ndarray):
        if img_input.ndim == 3:
            img = Image.fromarray(img_input).convert("L")
        else:
            img = Image.fromarray(img_input)
    else:
        raise ValueError("img_input must be str, PIL.Image, or numpy.ndarray")

    # --- NumPy配列に変換 ---
    gray = np.array(img).astype(np.uint8)

    # --- 白黒反転 ---
    inverted = 255 - gray

    # --- アルファチャンネルを生成（黒い部分だけ不透明） ---
    alpha = np.where(inverted < threshold, 255, 0).astype(np.uint8)

    # --- RGBに変換してアルファ合成 ---
    rgb = np.stack([inverted] * 3, axis=-1)
    rgba = np.dstack([rgb, alpha]).astype(np.uint8)

    # --- PIL Imageとして返す ---
    out_img = Image.fromarray(rgba, mode="RGBA")

    if save_path:
        os.makedirs(os.path.dirname(save_path) or ".", exist_ok=True)
        out_img.save(save_path, "PNG")

    return out_img
