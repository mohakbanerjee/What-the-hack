import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-7xl" aria-hidden="true">
        🧠
      </p>
      <h1 className="mt-4 font-display text-5xl font-extrabold">404. confidently.</h1>
      <p className="mt-3 text-xl text-white/70">this page is wrong, which means it fits in.</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-14 items-center rounded-full bg-pink px-6 text-lg font-bold text-white"
      >
        back to the dashboard
      </Link>
    </div>
  );
}
