import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image


# =====================================================
#  モデル定義（学習時と同じ構造）
# =====================================================
class MultiTaskCrackClassifier(nn.Module):
    def __init__(self, num_types=4, num_severities=4):
        super().__init__()
        base_model = models.resnet18(pretrained=False)
        in_features = base_model.fc.in_features
        base_model.fc = nn.Identity()
        self.backbone = base_model
        self.type_head = nn.Linear(in_features, num_types)
        self.severity_head = nn.Linear(in_features, num_severities)

    def forward(self, x):
        feats = self.backbone(x)
        type_out = self.type_head(feats)
        severity_out = self.severity_head(feats)
        return type_out, severity_out


# =====================================================
#  推論関数（結果を返す）
# =====================================================
def infer_crack_classifier(
    img_input,
    model_path="src/models/crack_multitask_classifier.pth",
    show=False,
    save_dir=None,
):
    """
    画像を入力してヒビの種類と危険度を分類する関数
    - img_input: str (画像パス or フォルダ) または PIL.Image.Image
    - model_path: 学習済みモデルのパス
    - show: Trueなら画像と結果を表示
    - save_dir: 出力画像の保存フォルダ（指定時のみ保存）

    戻り値: list of dict [{ "file": str, "type": str, "severity": str }]
    """
    if isinstance(img_input, Image.Image):
        if img_input.mode != "RGB":
            img_input = img_input.convert("RGB")  # ★ 自動変換
        img_list = [img_input]
        names = ["input_image"]

    crack_types = ["Other", "Linear", "Alligator", "Pothole"]
    severities = ["0", "1", "2", "3"]

    device = "cuda" if torch.cuda.is_available() else "cpu"

    # モデルロード
    model = MultiTaskCrackClassifier(
        num_types=len(crack_types), num_severities=len(severities)
    )
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()

    transform = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )

    # 入力画像リストを準備
    if isinstance(img_input, Image.Image):
        img_list = [img_input]
        names = ["input_image"]
    elif os.path.isdir(img_input):
        img_list = [
            Image.open(os.path.join(img_input, f)).convert("RGB")
            for f in os.listdir(img_input)
            if f.lower().endswith((".jpg", ".png", ".jpeg"))
        ]
        names = [
            f
            for f in os.listdir(img_input)
            if f.lower().endswith((".jpg", ".png", ".jpeg"))
        ]
    elif os.path.isfile(img_input):
        img_list = [Image.open(img_input).convert("RGB")]
        names = [os.path.basename(img_input)]
    else:
        raise ValueError(
            "img_input はファイルパス、フォルダ、またはPIL Imageである必要があります。"
        )

    results = []
    if save_dir:
        os.makedirs(save_dir, exist_ok=True)

    for img, name in zip(img_list, names):
        inp = transform(img).unsqueeze(0).to(device)

        with torch.no_grad():
            type_out, sev_out = model(inp)
            type_pred = torch.argmax(type_out, dim=1).item()
            sev_pred = torch.argmax(sev_out, dim=1).item()

        type_label = crack_types[type_pred]
        severity_label = severities[sev_pred]

        results.append({"file": name, "type": type_label, "classifier": severity_label})

        # オプション: 結果を可視化
        if show:
            import matplotlib.pyplot as plt

            plt.imshow(img)
            plt.title(f"Type: {type_label} | Severity: {severity_label}")
            plt.axis("off")
            plt.show(block=False)
            plt.pause(1.5)
            plt.close()

        # 保存
        if save_dir:
            base, ext = os.path.splitext(name)
            save_path = os.path.join(
                save_dir, f"{base}_{type_label}_{severity_label}{ext}"
            )
            img.save(save_path)

    return results


# =====================================================
#  メイン実行（CLI用）
# =====================================================
if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(
        description="Infer crack type and severity using multitask classifier"
    )
    parser.add_argument(
        "--img_path", type=str, required=True, help="Path to image or folder"
    )
    parser.add_argument(
        "--model_path",
        type=str,
        default="src/models/crack_multitask_classifier.pth",
        help="Trained model path",
    )
    parser.add_argument(
        "--save_dir", type=str, default=None, help="Optional output directory"
    )
    parser.add_argument("--show", action="store_true", help="Show image results")

    args = parser.parse_args()

    res = infer_crack_classifier(
        args.img_path, args.model_path, args.show, args.save_dir
    )
    print(json.dumps(res, indent=2, ensure_ascii=False))
