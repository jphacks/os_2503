from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from src.deepcrack_infer_folder import infer_crack_segment
from src.infer_crack_classifier import infer_crack_classifier
from src.db import register_segment_crack, update_egg_status, delete_crack
from src.invert_and_transparent_black import invert_and_transparent_black
from PIL import Image
import os
from supabase import create_client, Client
import dotenv
from pydantic import BaseModel
import requests
from io import BytesIO

dotenv.load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=ALLOWED_ORIGINS,
)

http_bearer = HTTPBearer(auto_error=False)


# ===== Pydantic モデル定義 =====
class AnalyzeRequest(BaseModel):
    img_url: str
    userID: str
    Latitude: float
    Longitude: float


class ResetEggRequest(BaseModel):
    userID: str


# ===== ルート =====
@app.get("/")
async def root():
    return {"message": "Hello World"}


# ===== /analyze エンドポイント =====
@app.post("/analyze")
async def analyze_image(req: AnalyzeRequest):
    # 画像を開く
    response = requests.get(req.img_url)
    response.raise_for_status()  # HTTPエラーの場合例外を出す

    img = Image.open(BytesIO(response.content)).convert("RGB")

    segment_img = infer_crack_segment(img_input=img)
    type_label, severity_label = infer_crack_classifier(img_input=segment_img)
    inverted_extracted = invert_and_transparent_black(img_input=segment_img)

    if type_label == "0":
        return {
            "segment_url": None,
            "crack_segment": None,
            "type": None,
            "severity": None,
            "crack_counts": None,
            "status": "None",
        }
    else:
        segment_url, crack_id = register_segment_crack(
            supabase=supabase,
            user_id=req.userID,
            segment=inverted_extracted,
            img_url=req.img_url,
            type=type_label,
            severity_id=severity_label,
            Latitude=req.Latitude,
            Longitude=req.Longitude,
        )

        crack_counts = update_egg_status(
            supabase=supabase,
            user_id=req.userID,
            crack_id=crack_id,
        )

    result = {
        "segment_url": segment_url,
        "type": type_label,
        "severity": severity_label,
        "crack_counts": crack_counts,
    }
    return result


# ===== /reset_egg エンドポイント =====
@app.post("/reset_egg")
async def reset_egg_status(req: ResetEggRequest):
    delete_crack(supabase=supabase, user_id=req.userID)
    return {"message": "Reset successful"}
