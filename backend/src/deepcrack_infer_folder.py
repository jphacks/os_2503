import os
import torch
import torchvision.transforms as transforms
import numpy as np
from PIL import Image
from src.models.deepcrack_networks import define_deepcrack


# =====================================================
#  DeepCrack セグメンテーション関数
# =====================================================
def infer_crack_segment(
    img_input,
    model_path="src/models/pretrained_net_G.pth",
    return_type="pil",  # "pil" or "numpy"
):
    """
    DeepCrackモデルでひび割れをセグメントする関数

    Args:
        img_input (str or PIL.Image.Image):
            画像ファイルパス または PIL画像オブジェクト
        model_path (str):
            学習済みモデルパス
        return_type (str):
            "pil" → PIL.Image で返す
            "numpy" → NumPy配列 (0–255, uint8) で返す
        save_path (str, optional):
            セグメント結果を保存するパス（指定時のみ保存）

    Returns:
        PIL.Image または np.ndarray: セグメントマップ
    """

    # --- デバイス設定 --- #
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # --- モデル構築 --- #
    crack_model = define_deepcrack(in_nc=3, num_classes=1, ngf=64).to(device).eval()

    # --- モデルロード --- #
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")

    state_dict = torch.load(model_path, map_location=device)
    crack_model.load_state_dict(state_dict)

    # --- 入力画像の読み込み --- #
    if isinstance(img_input, Image.Image):
        img = img_input.convert("RGB")
    elif isinstance(img_input, str) and os.path.isfile(img_input):
        img = Image.open(img_input).convert("RGB")
    else:
        raise ValueError(
            "img_input は画像パスまたはPIL.Image.Imageである必要があります。"
        )

    # --- 前処理 --- #
    transform = transforms.Compose(
        [transforms.ToTensor(), transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))]
    )
    input_tensor = transform(img).unsqueeze(0).to(device)

    # --- 推論 --- #
    with torch.no_grad():
        output = crack_model(input_tensor)

    # DeepCrackは複数の出力を返す (side1~5 + fuse)
    if isinstance(output, (list, tuple)):
        pred = output[-1]
    else:
        pred = output

    # --- 出力処理 --- #
    pred = pred.squeeze().cpu().numpy()
    pred = np.clip((pred + 1) / 2, 0, 1)  # [-1,1]→[0,1]
    pred = (pred * 255).astype("uint8")  # 0–255

    # --- 戻り値形式を選択 --- #
    if return_type == "pil":
        return Image.fromarray(pred)
    elif return_type == "numpy":
        return pred
    else:
        raise ValueError("return_type は 'pil' または 'numpy' のみ指定可能です。")
