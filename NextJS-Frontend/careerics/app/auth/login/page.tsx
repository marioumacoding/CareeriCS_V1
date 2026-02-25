/**
 * Login page placeholder.
 */

export const metadata = {
  title: "Login | CareeriCS",
};

export default function LoginPage() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Enter your credentials to access your account.
      </p>
      {/* Wire up with auth service + validation schemas */}
    </div>
  );
}
