import os
import uuid
import tempfile
import subprocess

from fastapi import HTTPException, UploadFile
from gtts import gTTS


# ---------------------------------------------
# Text-to-Speech
# ---------------------------------------------
def _generate_tts(text: str, directory: str) -> str:
    os.makedirs(directory, exist_ok=True)

    filename = f"{uuid.uuid4()}.mp3"
    full_path = os.path.join(directory, filename)

    gTTS(text=text, lang="en").save(full_path)

    return filename


# ---------------------------------------------
# Save Uploaded File (temp directory)
# ---------------------------------------------
async def save_uploaded_file(file: UploadFile) -> str:
    if not file.filename:
        raise ValueError("Uploaded file has no filename")

    file_ext = file.filename.split(".")[-1].lower()

    fd, file_path = tempfile.mkstemp(suffix=f".{file_ext}")
    with os.fdopen(fd, "wb") as buffer:
        buffer.write(await file.read())

    return file_path


# ---------------------------------------------
# File Cleanup
# ---------------------------------------------
def delete_files(*paths: str) -> None:
    for path in paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
        except OSError:
            pass


# ---------------------------------------------
# Media Conversion (outputs to temp directory)
# ---------------------------------------------
def convert_webm_to_wav(input_path: str) -> str:
    fd, output_path = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    result = subprocess.run(
        ["ffmpeg", "-y", "-i", input_path, output_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    if result.returncode != 0:
      raise RuntimeError(result.stderr.strip() or "ffmpeg failed converting to wav")

    return output_path

def convert_webm_to_mp4(input_path: str) -> str:
    fd, output_path = tempfile.mkstemp(suffix=".mp4")
    os.close(fd)
    result = subprocess.run(
        ["ffmpeg", "-y", "-i", input_path, output_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    if result.returncode != 0:
      raise RuntimeError(result.stderr.strip() or "ffmpeg failed converting to mp4")

    return output_path

def convert_audio_and_video(file_path: str) -> tuple[str, str]:
    try:
        mp4_path = convert_webm_to_mp4(file_path)
        if not os.path.exists(mp4_path):
            raise Exception("MP4 file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video conversion failed: {str(e)}")

    try:
        wav_path = convert_webm_to_wav(file_path)
        if not os.path.exists(wav_path):
            raise Exception("WAV file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio conversion failed: {str(e)}")

    return mp4_path, wav_path

