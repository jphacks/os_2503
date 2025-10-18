from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from deepcrack_infer_folder import infer_crack_segment
from infer_crack_classifier import infer_crack_classifier
from PIL import Image

# FastAPI アプリケーションの初期化
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

http_bearer = HTTPBearer(auto_error=False)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/analyze")
async def analyze_image(
    img_url: str,
    userID: str,
    Latitude: float,
    Longitude: float,
):

    img = Image.open(img_url).convert("RGB")

    segment = infer_crack_segment(img_input=img)
    classifier = infer_crack_classifier(img_input=img)
