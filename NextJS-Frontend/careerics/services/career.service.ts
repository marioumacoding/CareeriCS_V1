import { fastapiApi } from "@/lib/api";
import type {
  APICareerAnswerInput,
  APICareerAnswerRead,
  APICareerCardRead,
  APICareerCardSelectionItem,
  APICareerCardType,
  APICareerEvaluationRead,
  APICareerQuestionResponse,
  APICareerSelectedCardRead,
  APICareerSessionCreate,
  APICareerSessionRead,
  ApiResponse,
} from "@/types";

export const careerService = {
  createSession(
    payload: APICareerSessionCreate,
  ): Promise<ApiResponse<APICareerSessionRead>> {
    return fastapiApi.post<APICareerSessionRead>("/career/sessions/", payload);
  },

  getCardsByType(
    cardType: APICareerCardType,
  ): Promise<ApiResponse<APICareerCardRead[]>> {
    return fastapiApi.get<APICareerCardRead[]>(`/career/cards/${cardType}`);
  },

  selectCards(
    sessionId: string,
    cards: APICareerCardSelectionItem[],
  ): Promise<ApiResponse<APICareerSelectedCardRead[]>> {
    return fastapiApi.post<APICareerSelectedCardRead[]>(
      `/career/cards/select/${sessionId}`,
      { cards },
    );
  },

  getSelectedCards(
    sessionId: string,
  ): Promise<ApiResponse<APICareerSelectedCardRead[]>> {
    return fastapiApi.get<APICareerSelectedCardRead[]>(
      `/career/cards/selected/${sessionId}`,
    );
  },

  getQuestionsForSession(
    sessionId: string,
  ): Promise<ApiResponse<APICareerQuestionResponse[]>> {
    return fastapiApi.get<APICareerQuestionResponse[]>(`/career/questions/${sessionId}`);
  },

  submitAnswers(
    sessionId: string,
    answers: APICareerAnswerInput[],
  ): Promise<ApiResponse<APICareerAnswerRead[]>> {
    return fastapiApi.post<APICareerAnswerRead[]>(
      `/career/answers/${sessionId}`,
      { answers },
    );
  },

  evaluateCareerQuiz(
    sessionId: string,
  ): Promise<ApiResponse<APICareerEvaluationRead>> {
    return fastapiApi.get<APICareerEvaluationRead>(`/career/answers/${sessionId}/evaluate`);
  },

  getCareerResults(
    sessionId: string,
  ): Promise<ApiResponse<APICareerEvaluationRead>> {
    return fastapiApi.get<APICareerEvaluationRead>(`/career/answers/${sessionId}/results`);
  },
} as const;
