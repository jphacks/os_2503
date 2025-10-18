from supabase import Client


from supabase import Client
from io import BytesIO


def register_segment_crack(
    supabase: Client,
    user_id: str,
    segment: bytes,
    img_url: str,
    classifier,
    Latitude: float,
    Longitude: float,
):
    """
    セグメント画像を Supabase ストレージに登録し、
    cracksテーブルに保存、そのIDをuser_cracksにも登録する。

    Args:
        supabase (Client): Supabaseクライアント
        user_id (str): ユーザーID
        segment (bytes): セグメント画像データ（バイナリ）
        img_url (str): 元画像URL

    Returns:
        str: 公開URL
    """

    # === 1️⃣ 既存crack数を確認 ===
    count_response = (
        supabase.table("user_cracks")
        .select("crack_id", count="exact")
        .eq("user_id", user_id)
        .execute()
    )
    crack_count = (
        count_response.count
        if hasattr(count_response, "count")
        else len(count_response.data or [])
    )
    crack_index = crack_count + 1  # 新しい番号
    print(f"[i] Existing cracks for {user_id}: {crack_count}")

    # === 2️⃣ ファイル名を一意化してアップロード ===
    file_path = f"{user_id}/segment_{crack_index}.png"
    upload_response = supabase.storage.from_("crack_collector").upload(
        file_path, segment, {"upsert": True}
    )

    if upload_response.status_code not in [200, 201]:
        raise Exception(
            f"❌ Failed to upload segment image: {upload_response.error_message}"
        )

    # === 3️⃣ 公開URLを取得 ===
    public_url_response = supabase.storage.from_("crack_collector").get_public_url(
        file_path
    )
    segment_url = public_url_response.get("publicUrl")

    if not segment_url:
        raise Exception("❌ Failed to get public URL for uploaded image")

    # === 4️⃣ cracksテーブルに登録 ===
    cracks_response = (
        supabase.table("cracks")
        .insert(
            {
                "img_url": img_url,
                "segment_url": segment_url,
                "type_id": classifier.type_id,
                "severity_id": classifier.severity_id,
                "latitude": Latitude,
                "longitude": Longitude,
            }
        )
        .execute()
    )

    if cracks_response.error:
        raise Exception(f"❌ Failed to insert crack record: {cracks_response.error}")

    crack_id = cracks_response.data[0]["id"]
    print(f"[+] New crack inserted with id={crack_id}")

    # === 5️⃣ user_cracksテーブルに紐付け登録 ===
    user_cracks_response = (
        supabase.table("user_cracks")
        .insert({"user_id": user_id, "crackId": crack_id})
        .execute()
    )

    if user_cracks_response.error:
        raise Exception(
            f"❌ Failed to insert user_crack record: {user_cracks_response.error}"
        )

    print(f"✅ Registered user_crack link for {user_id} → {crack_id}")
    return segment_url, crack_id


def update_egg_status(
    supabase: Client,
    user_id: str,
    crack_id: str,
):
    """
    ユーザIDに基づき、egg_cracksテーブルにcrack_idを追加し、
    現在のeggに紐づくcrack_idの総数を返す。
    """
    # user_eggsからユーザのegg_idを取得
    user_eggs_response = (
        supabase.table("user_eggs").select("egg_id").eq("user_id", user_id).execute()
    )

    if not user_eggs_response.data:
        raise Exception(f"No egg found for user_id: {user_id}")

    egg_id = user_eggs_response.data[0]["egg_id"]

    # egg_cracksにcrack_idを登録
    insert_response = (
        supabase.table("egg_cracks")
        .insert({"egg_id": egg_id, "crack_id": crack_id})
        .execute()
    )

    if insert_response.status_code not in (200, 201):
        raise Exception(f"Failed to insert crack_id: {insert_response.error_message}")

    # 登録済みのcrack_id総数をカウント
    crack_response = (
        supabase.table("egg_cracks").select("crack_id").eq("egg_id", egg_id).execute()
    )
    crack_count = len(crack_response.data)

    return crack_count
