"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-app px-8">
      <div className="mb-4 text-5xl">😞</div>
      <h1 className="mb-2 text-xl font-bold text-text-primary">
        משהו השתבש
      </h1>
      <p className="mb-8 text-sm text-text-secondary">
        אירעה שגיאה. נסה לרענן את הדף.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-accent-blue px-6 py-3 text-sm font-semibold text-white"
      >
        נסה שוב
      </button>
    </div>
  );
}
