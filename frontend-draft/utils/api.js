import { apiClient } from "./apiClient";

/* -------------------------------------------------
   QUESTIONS
-------------------------------------------------- */

export const fetchQuestion = async (questionId) => {
  return await apiClient.get(`/questions/${questionId}`);
};

export const fetchAllQuestions = async () => {
  return await apiClient.get(`/questions/`);
};

/* -------------------------------------------------
   ANSWERS
-------------------------------------------------- */

export const fetchAnswer = async (sessionId, questionId) => {
  return await apiClient.get(
    `/answers/session/${sessionId}/question/${questionId}`
  );
};

export const submitAnswer = async (sessionId, questionId, mediaFile) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("question_id", questionId);
  formData.append("audio", mediaFile);

  return await apiClient.post(`/answers/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getSessionAnswers = async (sessionId) => {
  return await apiClient.get(`/answers/session/${sessionId}`);
};

/* -------------------------------------------------
   SESSIONS
-------------------------------------------------- */

export const createSession = async (userId, name = "New Session") => {
  return await apiClient.post(`/sessions/`, {
    user_id: userId,
    name,
    type: "Behavioral",
    status: "in_progress",
  });
};

export const getSessions = async () => {
  return await apiClient.get(`/sessions/`);
};

/* -------------------------------------------------
   EVALUATION + EMOTION AGGREGATION
-------------------------------------------------- */
export const evaluateAnswer = async (sessionId, questionId) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("question_id", questionId);

  return await apiClient.post(`/evaluate/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

