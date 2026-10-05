"use client";

import { useRouter } from "next/navigation";
import { BookForm } from "@/components/book-form";
import { useBooks } from "@/lib/book-context";

export function NewBook() {
  const router = useRouter();
  const { addBook } = useBooks();

  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <div>
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          New title
        </p>
        <h1 className="mt-2 font-serif text-5xl tracking-tight">Add a book to the shelf.</h1>
        <p className="mt-3 text-ink-soft">
          A record needs a title, an author, the bookstore that holds it, and an ISBN.
        </p>
      </div>
      <BookForm
        submitLabel="Add to the shelf"
        onSubmit={(value) => {
          const book = addBook(value);
          router.push(`/catalog/${book.id}`);
        }}
      />
    </div>
  );
}
