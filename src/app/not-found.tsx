import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-4xl">That page is not on the shelf.</h1>
      <p className="mt-3 text-ink-soft">The address does not match a desk page.</p>
      <Link
        href="/"
        className="mt-5 inline-flex rounded-full bg-ink px-4 py-2 text-sm text-card"
      >
        Back to the desk
      </Link>
    </div>
  );
}
