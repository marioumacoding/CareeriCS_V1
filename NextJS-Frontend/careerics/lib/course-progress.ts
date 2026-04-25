export const COURSE_PROGRESS_UPDATED_EVENT = "course-progress-updated";

const COURSE_PROGRESS_STORAGE_KEY = "course-progress";

export interface CourseProgressItem {
  id: string;
  title: string;
  provider: string;
}

export interface CourseProgressState {
  current: CourseProgressItem[];
  completed: CourseProgressItem[];
}

export const DEFAULT_CURRENT_COURSES: CourseProgressItem[] = [
  { id: "html-beginner", title: "HTML Beginner", provider: "Top Courses" },
  { id: "javascript-advanced", title: "Javascript Advanced", provider: "Top Courses" },
  { id: "figma-fundamentals", title: "Figma Fundamentals", provider: "Top Courses" },
  { id: "node-basics", title: "Node.js Basics", provider: "Udemy" },
  { id: "ux-fundamentals", title: "UX Fundamentals", provider: "Udemy" },
];

export const DEFAULT_COMPLETED_COURSES: CourseProgressItem[] = [
  { id: "ux-fundamentals-completed", title: "UX Fundamentals", provider: "Udemy" },
  { id: "node-basics-completed", title: "Node.js Basics", provider: "Udemy" },
];

function normalizeCourseItem(raw: unknown): CourseProgressItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const maybe = raw as Partial<CourseProgressItem>;
  if (typeof maybe.id !== "string" || typeof maybe.title !== "string" || typeof maybe.provider !== "string") {
    return null;
  }

  return {
    id: maybe.id,
    title: maybe.title,
    provider: maybe.provider,
  };
}

function normalizeUniqueCourses(entries: CourseProgressItem[]): CourseProgressItem[] {
  const byId = new Map<string, CourseProgressItem>();

  for (const entry of entries) {
    if (!byId.has(entry.id)) {
      byId.set(entry.id, entry);
    }
  }

  return Array.from(byId.values());
}

function normalizeState(state: CourseProgressState): CourseProgressState {
  const completed = normalizeUniqueCourses(state.completed);
  const completedIds = new Set(completed.map((course) => course.id));
  const current = normalizeUniqueCourses(state.current.filter((course) => !completedIds.has(course.id)));

  return { current, completed };
}

function readStorage(): CourseProgressState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY);
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

function notifyCourseProgressUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(COURSE_PROGRESS_UPDATED_EVENT));
}

export function loadCourseProgress(): CourseProgressState {
  return readStorage() || normalizeState({ current: DEFAULT_CURRENT_COURSES, completed: DEFAULT_COMPLETED_COURSES });
}

export function saveCourseProgress(state: CourseProgressState): CourseProgressState {
  const normalized = normalizeState(state);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(normalized));
    notifyCourseProgressUpdated();
  }

  return normalized;
}

export function enrollCourse(course: CourseProgressItem): CourseProgressState {
  const progress = loadCourseProgress();
  const nextCompleted = progress.completed.filter((item) => item.id !== course.id);
  const nextCurrent = [course, ...progress.current.filter((item) => item.id !== course.id)];

  return saveCourseProgress({ current: nextCurrent, completed: nextCompleted });
}

export function completeCourse(courseId: string): CourseProgressState {
  const progress = loadCourseProgress();
  const course = progress.current.find((item) => item.id === courseId);

  if (!course) {
    return progress;
  }

  const nextCurrent = progress.current.filter((item) => item.id !== courseId);
  const nextCompleted = [course, ...progress.completed.filter((item) => item.id !== courseId)];

  return saveCourseProgress({ current: nextCurrent, completed: nextCompleted });
}