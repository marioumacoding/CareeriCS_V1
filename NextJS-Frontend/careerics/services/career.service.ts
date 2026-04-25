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
  APICareerTrack,
  ApiResponse,
} from "@/types";

let cachedCareerTracks: APICareerTrack[] | null = null;
let careerTracksPromise: Promise<ApiResponse<APICareerTrack[]>> | null = null;

export const careerService = {
  listTracks(): Promise<ApiResponse<APICareerTrack[]>> {
    if (cachedCareerTracks) {
      return Promise.resolve({
        data: cachedCareerTracks,
        success: true,
      });
    }

    if (careerTracksPromise) {
      return careerTracksPromise;
    }

    careerTracksPromise = fastapiApi.get<APICareerTrack[]>("/career/tracks/").then((response) => {
      if (response.success && response.data) {
        cachedCareerTracks = response.data;
      }

      return response;
    }).finally(() => {
      careerTracksPromise = null;
    });

    return careerTracksPromise;
  },

  createSession(
    payload: APICareerSessionCreate,
  ): Promise<ApiResponse<APICareerSessionRead>> {
    return fastapiApi.post<APICareerSessionRead>("/career/sessions/", payload);
  },

  getUserSessions(
    userId: string,
  ): Promise<ApiResponse<APICareerSessionRead[]>> {
    return fastapiApi.get<APICareerSessionRead[]>(`/career/sessions/user/${userId}`);
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
