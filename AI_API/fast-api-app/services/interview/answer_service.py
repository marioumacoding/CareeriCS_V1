from sqlalchemy.orm import Session as DBSession
from fastapi import HTTPException, UploadFile
import db.models as models
from core.config import settings
from ai.completion import transcribe
from uuid import UUID

from utils.util import (
    save_uploaded_file, 
    _generate_tts,
    convert_audio_and_video,
    evaluate_answer_service,
    ser,
    fer, 
    emotion_evaluation,
    sentiment_analysis
)

# ============================================================
# SUBMIT ANSWER
# ============================================================
async def submit_answer_service(
    db: DBSession,
    session_id: UUID,
    question_id: UUID,
    audio: UploadFile,
):

    # Remove existing answer if exists
    existing_answer = (
        db.query(models.Answer)
        .filter_by(session_id=session_id, question_id=question_id)
        .first()
    )

    if existing_answer:
        db.delete(existing_answer)
        db.commit()

    # File processing
    uploaded_path = await save_uploaded_file(audio)
    mp4_path, wav_path = convert_audio_and_video(uploaded_path)
    transcript = transcribe(wav_path)

    # Create answer
    answer = models.Answer(
        session_id=session_id,
        question_id=question_id,
        answer_text=transcript,
        answer_audio=wav_path,
        answer_video=mp4_path,
        isfollowup=False,
    )

    db.add(answer)
    db.commit()
    db.refresh(answer)

    return {
        "answer_id": answer.id,
        "answer_text": answer.answer_text,
        "answer_audio": answer.answer_audio,
    }


# ============================================================
# EVALUATION
# ============================================================
async def evaluate_answer_service_wrapper(
    db: DBSession,
    session_id: UUID,
    question_id: UUID,
):

    answer = (
        db.query(models.Answer)
        .filter_by(session_id=session_id, question_id=question_id)
        .first()
    )
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    question = db.get(models.Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    session = db.get(models.Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    existing_followup = (
        db.query(models.Followup)
        .filter_by(answer_id=answer.id)
        .first()
    )

    is_followup_allowed = existing_followup is None

    evaluation = evaluate_answer_service(
        question_text=question.question_text,
        user_answer=answer.answer_text,
        interview_type=session.type,
        is_followup=is_followup_allowed,
    )

    score = evaluation["score"]
    feedback = evaluation["feedback"]
    improvement = evaluation["improvement"]
    followup_required = evaluation["followup_required"]

    # Follow-up flow
    if is_followup_allowed and followup_required:
        followup_info = _handle_followup(db, answer.id, improvement)

        return {
            "evaluation": None,
            "grade": None,
            "followup": followup_info,
            "emotion_evaluation": None,
            "tone_evaluation": None,
        }

    # Final evaluation
    updated_answer = _final_evaluation(db, answer, feedback, score)

    return {
        "evaluation": feedback,
        "grade": score,
        "followup": None,
        "emotion_evaluation": updated_answer.emotion_evaluation,
        "tone_evaluation": updated_answer.tone_evaluation,
    }


# ======================================================
# FOLLOW-UP HANDLING
# ======================================================

def _handle_followup(db: DBSession, answer_id: UUID, followup_text: str):
    """
    Create follow-up question with generated audio.
    """
    audio_filename = _generate_tts(
        followup_text,
        settings.AUDIO_PATHS["followups"]
    )

    followup = models.Followup(
        fquestion_text=followup_text,
        fquestion_audio=audio_filename,
        answer_id=answer_id,
    )

    db.add(followup)

    answer = db.get(models.Answer, answer_id)
    answer.isfollowup = True

    db.commit()
    db.refresh(followup)

    return {
        "id": followup.id,
        "text": followup.fquestion_text,
        "audio": f"/{settings.AUDIO_PATHS['followups']}/{audio_filename}"
    }


# ======================================================
# FINAL EVALUATION LOGIC
# ======================================================

def _final_evaluation(
    db: DBSession,
    answer,
    feedback: str,
    score: float
):
    """
    Apply FER, SER, Sentiment analysis and store evaluation.
    """

    # Run analysis pipelines
    emotions = fer(answer.answer_video)
    sentiments = sentiment_analysis(answer.answer_text)
    tone_result = ser(answer.answer_audio)

    # Store detected emotions
    for emotion_name in emotions:
        db.add(models.Emotion(
            name=emotion_name,
            answer_id=answer.id
        ))

    # Update answer fields
    answer.emotion_evaluation = emotion_evaluation(emotions)
    answer.sentiment_evaluation = sentiments
    answer.tone_evaluation = tone_result
    answer.feedback = feedback
    answer.grade = score
    answer.isfollowup = False

    db.commit()

    return answer