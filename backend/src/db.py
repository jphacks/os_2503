from supabase import Client
from io import BytesIO
from PIL import Image


def register_segment_crack(
    supabase: Client,
    user_id: str,
    segment,
    img_url: str,
    type: str,
    severity_id: int,
    Latitude: float,
    Longitude: float,
):
    """
    セグメント画像を Supabase ストレージに登録し、
    cracksテーブルに保存、そのIDをuser_cracksにも登録する。

    Args:
        supabase (Client): Supabaseクライアント
        user_id (str): ユーザーID
        segment (bytes or PIL.Image.Image): セグメント画像データ
        img_url (str): 元画像URL
        type (str): ひび分類タイプ
        severity_level (str): 重症度レベル
        Latitude (float): 緯度
        Longitude (float): 経度
    Returns:
        (segment_url: str, crack_id: int)
    """

    # === 1️⃣ user_eggsからegg_idを取得 ===
    user_eggs_response = (
        supabase.table("user_eggs").select("egg_id").eq("user_id", user_id).execute()
    )

    if not user_eggs_response.data:
        raise Exception(f"No egg found for user_id: {user_id}")

    egg_ids = [e["egg_id"] for e in user_eggs_response.data]

    if egg_ids:
        cracks_count_response = (
            supabase.table("egg_cracks")
            .select("crack_id", count="exact")
            .in_("egg_id", egg_ids)  # 複数のegg_idに対して数を取得
            .execute()
        )

        cracks_count = (
            cracks_count_response.count
            if hasattr(cracks_count_response, "count")
            else len(cracks_count_response.data or [])
        )
    else:
        cracks_count = 0

    crack_index = cracks_count + 1
    print(
        f"[i] User {user_id} has {cracks_count} existing cracks in their eggs. New index: {crack_index}"
    )

    # === 2️⃣ 画像をバイナリ化 ===
    if isinstance(segment, Image.Image):
        # PIL Image → PNGバイナリに変換
        buffer = BytesIO()
        segment.save(buffer, format="PNG")
        buffer.seek(0)
        binary_data = buffer.getvalue()
        print(f"[i] Converted PIL image to bytes ({len(binary_data)} bytes)")
    elif isinstance(segment, bytes):
        binary_data = segment
    else:
        raise TypeError("segment must be bytes or PIL.Image.Image")

    # === 3️⃣ ストレージにアップロード ===
    file_path = f"{user_id}/segment_{crack_index}.png"

    try:
        upload_response = supabase.storage.from_("crack_collector").upload(
            file_path, binary_data, {"upsert": "true"}
        )
    except Exception as e:
        raise Exception(f"Failed to upload segment image: {str(e)}")

    # === 4️⃣ 公開URLを取得 ===
    segment_url = supabase.storage.from_("crack_collector").get_public_url(file_path)

    if not isinstance(segment_url, str) or not segment_url.startswith("http"):
        raise Exception("Failed to get valid public URL for uploaded image")

    # === 5️⃣ cracksテーブルに登録 ===
    cracks_response = (
        supabase.table("cracks")
        .insert(
            {
                "img_url": img_url,
                "seg_url": segment_url,
                "type": type,
                "severity": severity_id,
                "latitude": Latitude,
                "longitude": Longitude,
            }
        )
        .execute()
    )

    if not cracks_response.data:
        raise Exception("Failed to insert crack record into cracks table")

    crack_id = cracks_response.data[0]["id"]

    # === 6️⃣ user_cracksテーブルに紐付け登録 ===
    user_cracks_response = (
        supabase.table("user_cracks")
        .insert({"user_id": user_id, "crack_id": crack_id})
        .execute()
    )

    if not user_cracks_response.data:
        raise Exception("Failed to insert user_crack record")

    return segment_url, crack_id


def update_egg_status(
    supabase: Client,
    user_id: str,
    crack_id: str,
):
    """
    ユーザIDに基づき、egg_cracksテーブルにcrack_idを追加し、
    現在のeggに紐づくcrack_idのseg_urlのリストを返す。
    """
    # === 1️⃣ user_eggsからegg_idを取得 ===
    user_eggs_response = (
        supabase.table("user_eggs").select("egg_id").eq("user_id", user_id).execute()
    )

    if not user_eggs_response.data:
        raise Exception(f"No egg found for user_id: {user_id}")

    egg_id = user_eggs_response.data[0]["egg_id"]

    # === 2️⃣ egg_cracksにcrack_idを登録 ===
    try:
        supabase.table("egg_cracks").insert(
            {"egg_id": egg_id, "crack_id": crack_id}
        ).execute()
    except Exception as e:
        raise Exception(f"Failed to insert crack_id into egg_cracks: {str(e)}")

    # === 3️⃣ 現在のeggに紐づくcrack_idを取得 ===
    egg_cracks_response = (
        supabase.table("egg_cracks").select("crack_id").eq("egg_id", egg_id).execute()
    )
    crack_ids = [item["crack_id"] for item in (egg_cracks_response.data or [])]

    # === 4️⃣ cracksテーブルからseg_urlを取得 ===
    seg_urls = []
    if crack_ids:
        cracks_response = (
            supabase.table("cracks").select("seg_url").in_("id", crack_ids).execute()
        )
        seg_urls = [item["seg_url"] for item in (cracks_response.data or [])]

    print(f"[i] Total cracks for egg_id={egg_id}: {len(seg_urls)}")
    return seg_urls


def delete_crack(user_id: str, supabase: Client):
    """
    特定のuser_idに紐づくeggs, egg_cracks, user_cracks, user_eggsを削除する。
    """
    # --- user_eggsからegg_idを取得 ---
    user_eggs_resp = (
        supabase.table("user_eggs").select("egg_id").eq("user_id", user_id).execute()
    )
    egg_ids = (
        [row["egg_id"] for row in user_eggs_resp.data] if user_eggs_resp.data else []
    )

    print(f"Found {len(egg_ids)} eggs linked to user {user_id}")

    # --- egg_cracks削除 ---
    if egg_ids:
        supabase.table("egg_cracks").delete().in_("egg_id", egg_ids).execute()
        print(f"Deleted egg_cracks linked to eggs {egg_ids}")

    print(f"All related data for user {user_id} has been deleted.")
