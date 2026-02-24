import os
import uuid
import subprocess
from typing import Tuple

from fastapi import UploadFile
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
# Save Uploaded File
# ---------------------------------------------
async def save_uploaded_file(
    file: UploadFile,
    folder: str = "audio/answers",
) -> str:

    os.makedirs(folder, exist_ok=True)

    if not file.filename:
        raise ValueError("Uploaded file has no filename")

    file_ext = file.filename.split(".")[-1].lower()

    saved_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(folder, saved_name)

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    return file_path


# ---------------------------------------------
# Media Conversion
# ---------------------------------------------
def convert_webm_to_wav(input_path: str) -> str:
    output_path = input_path.replace(".webm", ".wav")
    subprocess.run(
        ["ffmpeg", "-y", "-i", input_path, output_path],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    return output_path

def convert_webm_to_mp4(input_path: str) -> str:
    output_path = input_path.replace(".webm", ".mp4")
    subprocess.run(
        ["ffmpeg", "-y", "-i", input_path, output_path],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
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

