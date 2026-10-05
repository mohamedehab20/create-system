"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  isBook,
  newId,
  SEED_BOOKS,
  STORAGE_KEY,
  type Book,
  type BookInput,
} from "@/lib/books";

const listeners = new Set<() => void>();
let books: Book[] | null = null;

function readStorage(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_BOOKS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED_BOOKS;
    return parsed.filter(isBook);
  } catch {
    return SEED_BOOKS;
  }
}

function currentBooks() {
  if (books === null) books = readStorage();
  return books;
}

function write(next: Book[]) {
  books = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    books = readStorage();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  return currentBooks();
}

function getServerSnapshot() {
  return SEED_BOOKS;
}

export function useBooks() {
  const shelf = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addBook = useCallback((input: BookInput) => {
    const book: Book = {
      ...input,
      id: newId(),
      addedAt: new Date().toISOString(),
    };
    write([book, ...currentBooks()]);
    return book;
  }, []);

  const updateBook = useCallback((id: string, input: BookInput) => {
    write(
      currentBooks().map((book) => (book.id === id ? { ...book, ...input } : book)),
    );
  }, []);

  const removeBook = useCallback((id: string) => {
    write(currentBooks().filter((book) => book.id !== id));
  }, []);

  const setAvailable = useCallback((id: string, available: boolean) => {
    write(
      currentBooks().map((book) => {
        if (book.id !== id) return book;
        if (available && book.copies === 0) {
          return { ...book, copies: 1, available: true };
        }
        return { ...book, available: available && book.copies > 0 };
      }),
    );
  }, []);

  const restock = useCallback(() => {
    write(SEED_BOOKS);
  }, []);

  return {
    books: shelf,
    addBook,
    updateBook,
    removeBook,
    setAvailable,
    restock,
  };
}
