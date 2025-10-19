from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from deepcrack_infer_folder import infer_crack_segment
from infer_crack_classifier import infer_crack_classifier
from db import register_segment_crack, update_egg_status, delete_crack
from invert_and_transparent_black import invert_and_transparent_black
from PIL import Image
import os
from supabase import create_client, Client
import dotenv

dotenv.load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",")

# Supabase クライアントの初期化
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# FastAPI アプリケーションの初期化
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=ALLOWED_ORIGINS,
)

http_bearer = HTTPBearer(auto_error=False)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/analyze")
async def analyze_image(
    img_url: str,
    userID: str,
    Latitude: float,
    Longitude: float,
):

    img = Image.open(img_url).convert("RGB")

    segment_img = infer_crack_segment(img_input=img)

    type_label, severity_label = infer_crack_classifier(img_input=segment_img)

    inverted_extracted = invert_and_transparent_black(img_input=segment_img)

    if type_label == "0":
        return {
            "segment_url": None,
            "crack_segment": None,
            type_label: None,
            severity_label: None,
            "crack_counts": None,
            "status": "None",
        }
    else:
        # Supabase にセグメント画像を登録
        segment_url, crack_id = register_segment_crack(
            supabase=supabase,
            user_id=userID,
            segment=inverted_extracted,
            img_url=img_url,
            type=type_label,
            severity_id=severity_label,
            Latitude=Latitude,
            Longitude=Longitude,
        )
        # egg のステータスを更新
        crack_counts = update_egg_status(
            supabase=supabase,
            user_id=userID,
            crack_id=crack_id,
        )

    result = {
        "segment_url": segment_url,
        "type": type_label,
        "severity": severity_label,
        "crack_counts": crack_counts,
    }
    return result


@app.post("/reset_egg")
async def reset_egg_status(
    userID: str,
):
    delete_crack(supabase=supabase, user_id=userID)

    return {"message": "Reset successful"}
