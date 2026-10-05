"use client";

import Link from "next/link";
import { copyLabel, statusLabel, type Book } from "@/lib/books";
import { useBooks } from "@/lib/book-context";

export function Desk() {
  const { books, restock } = useBooks();

  const onShelf = books.filter((book) => book.available && book.copies > 0);
  const checkedOut = books.filter((book) => !book.available || book.copies === 0);
  const copiesReady = onShelf.reduce((sum, book) => sum + book.copies, 0);
  const stores = new Set(books.map((book) => book.bookstore)).size;
  const founding = books.find((book) => book.isbn === "9770933074");

  return (
    <div className="grid gap-10">
      <section className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
            Library desk
          </p>
          <h1 className="mt-3 max-w-xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">
            What is on the shelf today.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-ink-soft">
            Each record keeps the title, the author, the bookstore, and the ISBN,
            then shows whether copies are still available.
          </p>
          <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            <Stat label="Titles" value={books.length} />
            <Stat label="On the shelf" value={onShelf.length} />
            <Stat label="Copies ready" value={copiesReady} />
            <Stat label="Bookstores" value={stores} />
          </dl>
        </div>
        {books.length === 0 ? (
          <aside className="rounded-xl border border-dashed border-line bg-card p-5">
            <h2 className="font-serif text-2xl">The shelf is empty.</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Add the first title, or bring back the sample shelf, including يوتوبيا.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/catalog/new"
                className="rounded-full bg-burgundy px-4 py-2 text-sm text-card"
              >
                Add title
              </Link>
              <button
                type="button"
                onClick={restock}
                className="rounded-full border border-line px-4 py-2 text-sm"
              >
                Restock samples
              </button>
            </div>
          </aside>
        ) : founding ? (
          <FoundingBook book={founding} />
        ) : (
          <aside className="rounded-xl border border-dashed border-line bg-card p-5">
            <h2 className="font-serif text-2xl">The sample title is gone.</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              يوتوبيا is no longer in this browser. The rest of the shelf is still here.
            </p>
            <button
              type="button"
              onClick={restock}
              className="mt-4 rounded-full border border-line px-4 py-2 text-sm"
            >
              Restock samples
            </button>
          </aside>
        )}
      </section>

      {books.length > 0 ? (
        <section className="grid gap-8 lg:grid-cols-2">
          <BookColumn
            title="On the shelf"
            empty="Nothing is waiting to be lent."
            books={onShelf}
          />
          <BookColumn
            title="Checked out"
            empty="Every copy is still on the shelf."
            books={checkedOut}
          />
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card px-4 py-4">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="mt-1 font-serif text-4xl leading-none">{value}</dd>
    </div>
  );
}

function FoundingBook({ book }: { book: Book }) {
  return (
    <aside className="rounded-xl bg-ink p-5 text-card">
      <p className="text-xs tracking-[0.16em] text-gold uppercase">Sample record</p>
      <h2 className="mt-3 font-serif text-4xl" dir="auto" lang="ar">
        {book.title}
      </h2>
      <p className="mt-2 text-card/80" dir="auto" lang="ar">
        {book.author}
      </p>
      <dl className="mt-5 grid gap-2 text-sm">
        <div className="flex justify-between gap-4 border-t border-white/15 pt-2">
          <dt className="text-card/60">Bookstore</dt>
          <dd>{book.bookstore}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-white/15 pt-2">
          <dt className="text-card/60">ISBN</dt>
          <dd className="font-mono">{book.isbn}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-white/15 pt-2">
          <dt className="text-card/60">Status</dt>
          <dd>
            {statusLabel(book)} · {copyLabel(book.copies)}
          </dd>
        </div>
      </dl>
      <Link
        href={`/catalog/${book.id}`}
        className="mt-5 inline-flex rounded-full bg-card px-4 py-2 text-sm font-medium text-ink"
      >
        Open this title
      </Link>
    </aside>
  );
}

function BookColumn({
  title,
  empty,
  books,
}: {
  title: string;
  empty: string;
  books: Book[];
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl">{title}</h2>
        <span className="text-sm text-ink-soft">{books.length}</span>
      </div>
      {books.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-sm text-ink-soft">
          {empty}
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {books.map((book) => (
            <li key={book.id}>
              <Link
                href={`/catalog/${book.id}`}
                className="flex items-baseline justify-between gap-4 px-4 py-3 hover:bg-paper"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium" dir="auto">
                    {book.title}
                  </span>
                  <span className="block truncate text-sm text-ink-soft" dir="auto">
                    {book.author}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-ink-soft">
                  {copyLabel(book.copies)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
