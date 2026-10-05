"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookForm } from "@/components/book-form";
import { copyLabel, spineColor, statusLabel } from "@/lib/books";
import { useBooks } from "@/lib/book-context";

export function BookEditor({ id }: { id: string }) {
  const router = useRouter();
  const { books, updateBook, removeBook, setAvailable } = useBooks();
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const book = books.find((item) => item.id === id);

  if (!book) {
    return (
      <div className="max-w-lg">
        <h1 className="font-serif text-4xl">This title is not on record.</h1>
        <p className="mt-3 text-ink-soft">
          It may have been removed from this browser.
        </p>
        <Link
          href="/catalog"
          className="mt-5 inline-flex rounded-full bg-ink px-4 py-2 text-sm text-card"
        >
          Back to the catalog
        </Link>
      </div>
    );
  }

  const onShelf = book.available && book.copies > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="h-3" style={{ backgroundColor: spineColor(book.id) }} />
        <div className="p-5">
          <p className="text-xs font-medium tracking-[0.16em] text-gold uppercase">
            {statusLabel(book)}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight" dir="auto">
            {book.title}
          </h1>
          <p className="mt-2 text-lg text-ink-soft" dir="auto">
            {book.author}
          </p>
          <dl className="mt-6 grid gap-3 text-sm">
            <Row label="Bookstore" value={book.bookstore} />
            <Row label="ISBN" value={book.isbn} mono />
            <Row label="Copies" value={copyLabel(book.copies)} />
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setAvailable(book.id, !onShelf);
                setSaved(false);
              }}
              className="rounded-full bg-forest px-4 py-2 text-sm text-card"
            >
              {book.copies === 0 ? "Add a copy" : onShelf ? "Check out" : "Return to shelf"}
            </button>
            {confirming ? (
              <button
                type="button"
                onClick={() => {
                  removeBook(book.id);
                  router.push("/catalog");
                }}
                className="rounded-full bg-burgundy px-4 py-2 text-sm text-card"
              >
                Confirm remove
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="rounded-full border border-line px-4 py-2 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-3xl">Edit this record</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Update the title, author, bookstore, ISBN, or how many copies remain.
        </p>
        {saved ? (
          <p className="mt-3 text-sm text-forest" role="status">
            Saved.
          </p>
        ) : null}
        <div className="mt-5">
          <BookForm
            key={`${book.id}-${book.available}-${book.copies}`}
            initial={book}
            submitLabel="Save changes"
            onSubmit={(value) => {
              updateBook(book.id, value);
              setSaved(true);
              setConfirming(false);
            }}
          />
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={mono ? "font-mono" : ""} dir="auto">
        {value}
      </dd>
    </div>
  );
}
