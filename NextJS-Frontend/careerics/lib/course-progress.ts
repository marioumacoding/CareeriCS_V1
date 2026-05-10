export const COURSE_PROGRESS_UPDATED_EVENT = "course-progress-updated";

const COURSE_PROGRESS_STORAGE_KEY = "course-progress";
const COURSE_PROGRESS_STORAGE_SCOPE_GUEST = "__guest__";
const LEGACY_MOCK_COURSE_IDS = new Set([
  "html-beginner",
  "javascript-advanced",
  "figma-fundamentals",
  "node-basics",
  "ux-fundamentals",
  "ux-fundamentals-completed",
  "node-basics-completed",
]);

export interface CourseProgressItem {
  id: string;
  title: string;
  provider: string;
  url?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  updatedAt?: string | null;
}

export interface CourseProgressState {
  current: CourseProgressItem[];
  completed: CourseProgressItem[];
}

export const EMPTY_COURSE_PROGRESS_STATE: CourseProgressState = {
  current: [],
  completed: [],
};

function getStorageScope(userId?: string | null): string {
  const normalized = userId?.trim();
  return normalized || COURSE_PROGRESS_STORAGE_SCOPE_GUEST;
}

function getScopedStorageKey(userId?: string | null): string {
  return `${COURSE_PROGRESS_STORAGE_KEY}:${getStorageScope(userId)}`;
}

function isLegacyMockCourseId(courseId: string): boolean {
  return LEGACY_MOCK_COURSE_IDS.has(courseId);
}

function normalizeCourseItem(raw: unknown): CourseProgressItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const maybe = raw as Partial<CourseProgressItem>;
  if (
    typeof maybe.id !== "string" ||
    typeof maybe.title !== "string" ||
    typeof maybe.provider !== "string" ||
    isLegacyMockCourseId(maybe.id)
  ) {
    return null;
  }

  return {
    id: maybe.id,
    title: maybe.title,
    provider: maybe.provider,
    url: typeof maybe.url === "string" ? maybe.url : null,
    startedAt: typeof maybe.startedAt === "string" ? maybe.startedAt : null,
    completedAt: typeof maybe.completedAt === "string" ? maybe.completedAt : null,
    updatedAt: typeof maybe.updatedAt === "string" ? maybe.updatedAt : null,
  };
}

function mergeCourseItems(primary: CourseProgressItem, secondary: CourseProgressItem): CourseProgressItem {
  return {
    ...secondary,
    ...primary,
    url: primary.url || secondary.url || null,
    startedAt: primary.startedAt || secondary.startedAt || null,
    completedAt: primary.completedAt || secondary.completedAt || null,
    updatedAt: primary.updatedAt || secondary.updatedAt || null,
  };
}

function normalizeUniqueCourses(entries: CourseProgressItem[]): CourseProgressItem[] {
  const byId = new Map<string, CourseProgressItem>();

  for (const entry of entries) {
    const existing = byId.get(entry.id);
    byId.set(entry.id, existing ? mergeCourseItems(existing, entry) : entry);
  }

  return Array.from(byId.values());
}

function normalizeState(state: CourseProgressState): CourseProgressState {
  const completed = normalizeUniqueCourses(state.completed);
  const completedIds = new Set(completed.map((course) => course.id));
  const current = normalizeUniqueCourses(
    state.current.filter((course) => !completedIds.has(course.id)),
  );

  return { current, completed };
}

function parseStoredState(raw: string | null): CourseProgressState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { current?: unknown; completed?: unknown };
    if (!Array.isArray(parsed.current) || !Array.isArray(parsed.completed)) {
      return null;
    }

    const current = parsed.current
      .map((item) => normalizeCourseItem(item))
      .filter((item): item is CourseProgressItem => Boolean(item));
    const completed = parsed.completed
      .map((item) => normalizeCourseItem(item))
      .filter((item): item is CourseProgressItem => Boolean(item));

    return normalizeState({ current, completed });
  } catch {
    return null;
  }
}

function persistState(
  state: CourseProgressState,
  userId?: string | null,
  shouldNotify = true,
): CourseProgressState {
  const normalized = normalizeState(state);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(getScopedStorageKey(userId), JSON.stringify(normalized));

    if (shouldNotify) {
      window.dispatchEvent(
        new CustomEvent(COURSE_PROGRESS_UPDATED_EVENT, {
          detail: { scope: getStorageScope(userId) },
        }),
      );
    }
  }

  return normalized;
}

function readStorage(userId?: string | null): CourseProgressState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const scopedState = parseStoredState(window.localStorage.getItem(getScopedStorageKey(userId)));
  if (scopedState) {
    return scopedState;
  }

  const legacyState = parseStoredState(window.localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY));
  if (!legacyState) {
    return null;
  }

  window.localStorage.removeItem(COURSE_PROGRESS_STORAGE_KEY);
  return persistState(legacyState, userId, false);
}

export function loadCourseProgress(userId?: string | null): CourseProgressState {
  return readStorage(userId) || EMPTY_COURSE_PROGRESS_STATE;
}

export function saveCourseProgress(
  state: CourseProgressState,
  userId?: string | null,
): CourseProgressState {
  return persistState(state, userId, true);
}

export function enrollCourse(
  course: CourseProgressItem,
  userId?: string | null,
): CourseProgressState {
  const now = new Date().toISOString();
  const progress = loadCourseProgress(userId);
  const nextCompleted = progress.completed.filter((item) => item.id !== course.id);
  const nextCurrent = [
    {
      ...course,
      url: course.url || null,
      startedAt: course.startedAt || now,
      completedAt: null,
      updatedAt: now,
    },
    ...progress.current.filter((item) => item.id !== course.id),
  ];

  return saveCourseProgress({ current: nextCurrent, completed: nextCompleted }, userId);
}

export function completeCourse(courseId: string, userId?: string | null): CourseProgressState {
  const progress = loadCourseProgress(userId);
  const course = progress.current.find((item) => item.id === courseId);

  if (!course) {
    return progress;
  }

  const now = new Date().toISOString();
  const nextCurrent = progress.current.filter((item) => item.id !== courseId);
  const nextCompleted = [
    {
      ...course,
      completedAt: now,
      updatedAt: now,
    },
    ...progress.completed.filter((item) => item.id !== courseId),
  ];

  return saveCourseProgress({ current: nextCurrent, completed: nextCompleted }, userId);
}

export function retakeCourse(courseId: string, userId?: string | null): CourseProgressState {
  const progress = loadCourseProgress(userId);
  const course = progress.completed.find((item) => item.id === courseId);

  if (!course) {
    return progress;
  }

  const now = new Date().toISOString();
  const nextCompleted = progress.completed.filter((item) => item.id !== courseId);
  const nextCurrent = [
    {
      ...course,
      startedAt: now,
      completedAt: null,
      updatedAt: now,
    },
    ...progress.current.filter((item) => item.id !== courseId),
  ];

  return saveCourseProgress({ current: nextCurrent, completed: nextCompleted }, userId);
}
