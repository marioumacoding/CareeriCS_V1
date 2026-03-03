import { useState, useEffect } from "react";
import ChatWindow from "../components/ChatWindow";
import AudioRecorder from "../components/AudioRecorder";
import {
  fetchQuestion,
  submitAnswer,
  evaluateAnswer,
  createSession,
} from "../utils/api";
import { API_BASE_URL } from "../utils/apiClient";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const QUESTION_ID = 1;

  useEffect(() => {
    initSessionAndQuestion();
  }, []);

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const initSessionAndQuestion = async () => {
    try {
      // ---- create session ----
      const session = await createSession(1, "Interview Session");
      setSessionId(session.id);

      // ---- load question ----
      const question = await fetchQuestion(QUESTION_ID);
      setCurrentQuestion(question);

      addMessage({
        role: "system",
        text: question.question_text,
        audio: question.question_audio
          ? `${API_BASE_URL}/static/audio/questions/${question.question_audio}`
          : null,
      });
    } catch (err) {
      console.error("Initialization failed:", err);
    }
  };

  const handleAnswer = async (videoFile) => {
    if (!currentQuestion || !sessionId) return;

    try {
      // ---- submit answer ----
      const answerResult = await submitAnswer(
        sessionId,
        currentQuestion.id,
        videoFile
      );

      addMessage({
        role: "user",
        text: answerResult.answer_text,
      });

      // ---- evaluate (FIXED) ----
      const evalResult = await evaluateAnswer(
        sessionId,
        currentQuestion.id
      );

      if (!evalResult) return;

      addMessage({
        role: "system",
        text: `${evalResult.evaluation}`,
      });

      // ---- follow-up ----
      if (evalResult.followup) {
        addMessage({
          role: "system",
          text: evalResult.followup.fquestion_text,
          audio: `${API_BASE_URL}${evalResult.followup.fquestion_audio}`,
        });
      }
    } catch (err) {
      console.error("Error handling answer:", err);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto" }}>
      <h1>Interview Chat</h1>
      <ChatWindow messages={messages} />
      <AudioRecorder onSubmit={handleAnswer} />
    </div>
  );
}