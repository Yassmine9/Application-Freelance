import os
import uuid
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx"}

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
UPLOAD_ROOT = os.path.join(BASE_DIR, "uploads")


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def save_upload(file, subdir: str) -> dict:
    if not file or not getattr(file, "filename", ""):
        raise ValueError("Missing file")

    filename = secure_filename(file.filename)
    ext = os.path.splitext(filename)[1].lstrip(".").lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type")

    _ensure_dir(UPLOAD_ROOT)
    target_dir = os.path.join(UPLOAD_ROOT, subdir)
    _ensure_dir(target_dir)

    unique_name = f"{uuid.uuid4().hex}_{filename}"
    relative_path = os.path.join(subdir, unique_name).replace("\\", "/")
    file_path = os.path.join(UPLOAD_ROOT, relative_path)
    file.save(file_path)

    return {
        "filename": filename,
        "relative_path": relative_path
    }
