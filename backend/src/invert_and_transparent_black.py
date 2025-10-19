from typing import Union
from PIL import Image
import numpy as np
import os


from typing import Union
from PIL import Image
import numpy as np
import os


def invert_and_transparent_black(
    img_input: Union[str, Image.Image, np.ndarray],
    threshold: int = 80,
    save_path: str = None,
) -> Image.Image:
    """
    白い部分のみを黒色で抜き出し、それ以外を透過させる (RGBA出力)。

    Args:
        img_input: 画像パス (str) / PIL.Image / numpy.ndarray (H,W[,C])
        threshold: 白判定の閾値 (0〜255)。高いほど厳しく白だけ抜き出す。
        save_path: 保存パス (例: 'out.png')。省略可。

    Returns:
        PIL.Image (RGBA)。白部分は黒、不透明。他は透明。
    """

    # --- 入力をPIL.Imageに統一 ---
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

    # --- NumPy配列化 ---
    gray = np.array(img).astype(np.uint8)

    # --- 白領域のマスク作成 ---
    mask = (gray >= threshold).astype(np.uint8) * 255  # 白い部分だけ255

    # --- 出力画像を作成 ---
    rgb = np.zeros((gray.shape[0], gray.shape[1], 3), dtype=np.uint8)  # 黒塗り
    alpha = mask  # 白部分だけ不透明

    rgba = np.dstack([rgb, alpha]).astype(np.uint8)
    out_img = Image.fromarray(rgba, mode="RGBA")

    # --- 保存オプション ---
    if save_path:
        os.makedirs(os.path.dirname(save_path) or ".", exist_ok=True)
        out_img.save(save_path, "PNG")

    return out_img
