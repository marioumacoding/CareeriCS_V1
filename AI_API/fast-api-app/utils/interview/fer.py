import cv2
from deepface import DeepFace
from fastapi import HTTPException

def extract_frames_per_second(video_path: str, target_fps: int = 2):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Cannot open video")
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    if video_fps <= 0:
        raise RuntimeError("Invalid FPS")

    interval = int(round(video_fps / target_fps))
    frames = []
    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % interval == 0:
            frames.append(frame)
        frame_count += 1
    cap.release()
    return frames

def emotion_evaluation(emotion_list: list[str]) -> dict:
    total = len(emotion_list)
    result = {}
    if total == 0:
        return result
    for emotion in emotion_list:
        match emotion:
            case "happy": result["happy"] = result.get("happy", 0) + 1
            case "sad": result["sad"] = result.get("sad", 0) + 1
            case "angry": result["angry"] = result.get("angry", 0) + 1
            case "neutral": result["neutral"] = result.get("neutral", 0) + 1
            case "fear": result["fear"] = result.get("fear", 0) + 1
            case "disgust": result["disgust"] = result.get("disgust", 0) + 1
            case "surprise": result["surprise"] = result.get("surprise", 0) + 1
            case _: result["unknown"] = result.get("unknown", 0) + 1
    for key in result:
        result[key] = round((result[key] / total) * 100, 2)
    return result


#------ Detect Emotions ------
def fer(mp4_path: str) -> list[str]:
    try:
        images = extract_frames_per_second(mp4_path)
        emotions_list = []

        for img in images:
            try:
                result = DeepFace.analyze(
                    img_path=img,
                    actions=['emotion'],
                    enforce_detection=False
                )
                emotions_list.append(result[0]['dominant_emotion'])
            except Exception:
                emotions_list.append(None)

        return emotions_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emotion Detection failed: {str(e)}")

