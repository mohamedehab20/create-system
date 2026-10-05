"use client";

import Link from "next/link";
import { useState } from "react";
import { copyLabel, spineColor, statusLabel, type Book } from "@/lib/books";

export function BookCard({
  book,
  onSetAvailable,
  onRemove,
}: {
  book: Book;
  onSetAvailable: (available: boolean) => void;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const onShelf = book.available && book.copies > 0;

  return (
    <article className="flex overflow-hidden rounded-xl border border-line bg-card">
      <div
        aria-hidden
        className="w-3 shrink-0"
        style={{ backgroundColor: spineColor(book.id) }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-2xl leading-tight" dir="auto">
              <Link href={`/catalog/${book.id}`} className="hover:text-burgundy">
                {book.title}
              </Link>
            </h2>
            <span
              className={
                onShelf
                  ? "rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest"
                  : "rounded-full bg-burgundy/10 px-2.5 py-0.5 text-xs font-medium text-burgundy"
              }
            >
              {statusLabel(book)}
            </span>
          </div>
          <p className="mt-1 text-ink-soft" dir="auto">
            {book.author}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            <span dir="auto">{book.bookstore}</span>
            <span aria-hidden> · </span>
            <span className="font-mono">{book.isbn}</span>
            <span aria-hidden> · </span>
            {copyLabel(book.copies)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/catalog/${book.id}`}
            className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-ink"
          >
            Open
          </Link>
          <button
            type="button"
            onClick={() => onSetAvailable(!onShelf)}
            className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-ink"
          >
            {book.copies === 0 ? "Add a copy" : onShelf ? "Check out" : "Return"}
          </button>
          {confirming ? (
            <>
              <button
                type="button"
                onClick={onRemove}
                className="rounded-full bg-burgundy px-3 py-1.5 text-sm text-card"
              >
                Confirm remove
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-full px-3 py-1.5 text-sm text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-full px-3 py-1.5 text-sm text-ink-soft hover:text-burgundy"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
