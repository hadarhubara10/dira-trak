import Link from "next/link";

export default function StatsPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-app px-8">
      <div className="mb-4 text-5xl">📈</div>
      <h1 className="mb-2 text-xl font-bold text-text-primary">
        סטטיסטיקה
      </h1>
      <p className="mb-8 text-sm text-text-secondary">
        בקרוב - נתונים וגרפים על החיפוש שלכם
      </p>
      <Link
        href="/"
        className="rounded-xl bg-accent-blue px-6 py-3 text-sm font-semibold text-white"
      >
        חזרה לדאשבורד
      </Link>
    </div>
  );
}
