/**
 * Not-found page (app/not-found.tsx).
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">404</h2>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Go Home
      </Link>
    </div>
  );
}
