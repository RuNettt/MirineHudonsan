import os
import json
import random
import shutil
from uuid import uuid4

 
#  ----- 실행 방법 ------ 1. 백엔드 루트 디렉토리로 이동 2. python -m tools.bulk_seed_images
try:
    from app import create_app
    from app.models import db, Bukken
    app = create_app()
except Exception:
    from app import app  # noqa
    from app.models import db, Bukken  # noqa

# ---- 사용자 설정 ----
SRC_DIR = r"C:\Users\mg-e1\Pictures\hudousan"   # 테스트 이미지 모아둔 폴더
EACH = 1                                 # 매물(id) 하나당 몇 장 넣을지
SHUFFLE = True                           # True면 각 id마다 랜덤 선택
APPEND = False                           # True면 기존 image_paths에 추가, False면 덮어쓰기
CLEAR_DIR = True    # APPEND=False일 때 대상 폴더 비우기
UNIQUE_POOL = True   # 전 ID에 걸쳐 중복 없이 배분(소스 갯수 충분해야 함)

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}  # 허용 확장자
MAX_BYTES = 10 * 1024 * 1024  # 10MB 초과 파일은 스킵 (원하면 0으로 끄기)

# ----------------------------------------------

def list_images(dirpath):
    files = []
    for name in os.listdir(dirpath):
        ext = os.path.splitext(name)[1].lower()
        if ext in ALLOWED_EXTS:
            full = os.path.join(dirpath, name)
            try:
                if MAX_BYTES and os.path.getsize(full) > MAX_BYTES:
                    print(f"[SKIP size>MAX] {name}")
                    continue
            except Exception:
                pass
            files.append(name)
    return files

def main():
    if not os.path.isdir(SRC_DIR):
        raise SystemExit(f"SRC_DIR not found: {SRC_DIR}")

    with app.app_context():
        upload_root = app.config.get("UPLOAD_FOLDER")
        if not upload_root:
            raise SystemExit("UPLOAD_FOLDER not configured in Flask app.config")
        os.makedirs(upload_root, exist_ok=True)

        src_files = list_images(SRC_DIR)
        if not src_files:
            raise SystemExit("No valid images in SRC_DIR")

        ids = [b.id for b in Bukken.query.order_by(Bukken.id).all()]
        if not ids:
            raise SystemExit("No Bukken records")

        print(f"[INFO] UPLOAD_ROOT = {upload_root}")
        print(f"[INFO] {len(ids)} bukken(s), {len(src_files)} source images")

        # 전역 풀 준비 (UNIQUE_POOL=True일 때 중복 없는 분배용)
        pool = src_files[:]
        if SHUFFLE:
            random.shuffle(pool)

        for bukken_id in ids:
            dst_dir = os.path.join(upload_root, str(bukken_id))
            os.makedirs(dst_dir, exist_ok=True)

             # (옵션) 폴더 비우기: APPEND=False일 때 디렉토리도 초기화
            if not APPEND and CLEAR_DIR:
                for old in os.listdir(dst_dir):
                    try:
                        os.remove(os.path.join(dst_dir, old))
                    except Exception:
                        pass

            # ---- 픽 선택: UNIQUE_POOL이면 전역 풀에서 pop → 전 매물 중복 방지 ----
            if UNIQUE_POOL:
                if not pool:
                    print(f"[WARN] pool exhausted before id={bukken_id}; no images will be added")
                    picks = []
                else:
                    take = min(EACH, len(pool))
                    # 뒤에서부터 pop하여 중복 없이 배분
                    picks = [pool.pop() for _ in range(take)]
            else:
                # 기존 방식(전 매물 중복 허용)
                picks = src_files[:]
                if SHUFFLE:
                    random.shuffle(picks)
                picks = picks[:EACH]

            saved = []
            if APPEND:
                # 기존 image_paths 유지 후 추가
                b = Bukken.query.get(bukken_id)
                try:
                    saved = json.loads(b.image_paths) if b.image_paths else []
                    if not isinstance(saved, list):
                        saved = []
                except Exception:
                    saved = []

            new_paths = []
            for name in picks:
                src = os.path.join(SRC_DIR, name)
                ext = os.path.splitext(name)[1].lower()
                # 파일명 충돌 방지: id + uuid 조합
                new_name = f"{bukken_id}_{uuid4().hex}{ext}"
                dst = os.path.join(dst_dir, new_name)
                shutil.copy2(src, dst)
                new_paths.append(f"{bukken_id}/{new_name}")

            final = saved + new_paths if APPEND else new_paths

            b = Bukken.query.get(bukken_id)
            b.image_paths = json.dumps(final, ensure_ascii=False)
            db.session.commit()

            print(f"[OK] id={bukken_id} -> {len(new_paths)} added; total={len(final)}")

if __name__ == "__main__":
    main()
