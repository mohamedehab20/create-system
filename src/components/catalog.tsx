"use client";

import { useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { useBooks } from "@/lib/book-context";

type StatusFilter = "all" | "shelf" | "out";
type SortKey = "recent" | "title" | "author";

export function Catalog() {
  const { books, setAvailable, removeBook } = useBooks();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [store, setStore] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const stores = useMemo(
    () => [...new Set(books.map((book) => book.bookstore))].sort((a, b) => a.localeCompare(b)),
    [books],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const filtered = books.filter((book) => {
      const onShelf = book.available && book.copies > 0;
      if (status === "shelf" && !onShelf) return false;
      if (status === "out" && onShelf) return false;
      if (store !== "all" && book.bookstore !== store) return false;
      if (!needle) return true;
      return [book.title, book.author, book.bookstore, book.isbn]
        .join(" ")
        .toLocaleLowerCase()
        .includes(needle);
    });

    return filtered.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "author") return a.author.localeCompare(b.author);
      return b.addedAt.localeCompare(a.addedAt);
    });
  }, [books, query, status, store, sort]);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          Catalog
        </p>
        <h1 className="mt-2 font-serif text-5xl tracking-tight">Every title on record.</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Search by title, author, bookstore, or ISBN. Check a book out when it
          leaves the shelf, and return it when it comes back.
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-line bg-card p-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="يوتوبيا, Orwell, 9770933074"
            className="rounded-lg border border-line bg-paper px-3 py-2.5"
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <fieldset className="grid gap-1.5">
            <legend className="text-sm font-medium">Status</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["shelf", "On the shelf"],
                  ["out", "Checked out"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={status === value}
                  onClick={() => setStatus(value)}
                  className={
                    status === value
                      ? "rounded-full bg-ink px-3 py-1.5 text-sm text-card"
                      : "rounded-full border border-line px-3 py-1.5 text-sm"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-1.5 sm:ml-auto">
            <span className="text-sm font-medium">Bookstore</span>
            <select
              value={store}
              onChange={(event) => setStore(event.target.value)}
              className="rounded-lg border border-line bg-paper px-3 py-2"
            >
              <option value="all">All bookstores</option>
              {stores.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="rounded-lg border border-line bg-paper px-3 py-2"
            >
              <option value="recent">Recently added</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-ink-soft">
          {books.length === 0
            ? "No titles yet. Add one from the desk."
            : "No titles match that search."}
        </p>
      ) : (
        <div className="grid gap-3">
          <p className="text-sm text-ink-soft">
            {visible.length} {visible.length === 1 ? "title" : "titles"}
          </p>
          {visible.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSetAvailable={(available) => setAvailable(book.id, available)}
              onRemove={() => removeBook(book.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
