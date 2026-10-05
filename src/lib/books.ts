export type Book = {
  id: string;
  title: string;
  author: string;
  bookstore: string;
  isbn: string;
  copies: number;
  available: boolean;
  addedAt: string;
};

export type BookInput = {
  title: string;
  author: string;
  bookstore: string;
  isbn: string;
  copies: number;
  available: boolean;
};

export const STORAGE_KEY = "shorock.books.v1";

export const SEED_BOOKS: Book[] = [
  {
    id: "utopia",
    title: "يوتوبيا",
    author: "أحمد خالد توفيق",
    bookstore: "Shorock Store",
    isbn: "9770933074",
    copies: 4,
    available: true,
    addedAt: "2024-11-02T09:00:00.000Z",
  },
  {
    id: "orwell-1984",
    title: "1984",
    author: "George Orwell",
    bookstore: "Shorock Store",
    isbn: "9780451524935",
    copies: 2,
    available: true,
    addedAt: "2025-01-18T11:30:00.000Z",
  },
  {
    id: "beloved",
    title: "Beloved",
    author: "Toni Morrison",
    bookstore: "Diwan Bookshop",
    isbn: "9781400033416",
    copies: 1,
    available: false,
    addedAt: "2025-04-09T15:10:00.000Z",
  },
  {
    id: "little-prince",
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    bookstore: "Diwan Bookshop",
    isbn: "9780156012195",
    copies: 0,
    available: false,
    addedAt: "2025-06-21T08:45:00.000Z",
  },
  {
    id: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    bookstore: "Madbouly",
    isbn: "9780141439471",
    copies: 3,
    available: true,
    addedAt: "2025-08-30T13:20:00.000Z",
  },
];

const SPINES = ["#8d2f39", "#1f3d34", "#3d4a6b", "#8a5a2b", "#5c3d4e", "#24524a"];

export function spineColor(id: string) {
  let index = 0;
  for (const char of id) index = (index + char.charCodeAt(0)) % SPINES.length;
  return SPINES[index] ?? SPINES[0];
}

export function copyLabel(copies: number) {
  return copies === 1 ? "1 copy" : `${copies} copies`;
}

export function statusLabel(book: Pick<Book, "available" | "copies">) {
  if (book.copies === 0) return "No copies";
  return book.available ? "On the shelf" : "Checked out";
}

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `book-${Date.now()}`;
}

export function isBook(value: unknown): value is Book {
  if (!value || typeof value !== "object") return false;
  const book = value as Partial<Book>;
  return (
    typeof book.id === "string" &&
    typeof book.title === "string" &&
    typeof book.author === "string" &&
    typeof book.bookstore === "string" &&
    typeof book.isbn === "string" &&
    typeof book.copies === "number" &&
    typeof book.available === "boolean" &&
    typeof book.addedAt === "string"
  );
}

export type BookFormErrors = Partial<
  Record<"title" | "author" | "bookstore" | "isbn" | "copies", string>
>;

export function parseBookForm(
  form: FormData,
): { value: BookInput } | { errors: BookFormErrors } {
  const errors: BookFormErrors = {};
  const title = String(form.get("title") ?? "").trim();
  const author = String(form.get("author") ?? "").trim();
  const bookstore = String(form.get("bookstore") ?? "").trim();
  const isbn = String(form.get("isbn") ?? "")
    .trim()
    .replace(/[\s-]/g, "")
    .toUpperCase();
  const copiesRaw = String(form.get("copies") ?? "").trim();
  const available = form.get("available") === "on";

  if (!title) errors.title = "Add a title.";
  else if (title.length > 160) errors.title = "Keep the title under 160 characters.";

  if (!author) errors.author = "Add an author.";
  else if (author.length > 120) errors.author = "Keep the author under 120 characters.";

  if (!bookstore) errors.bookstore = "Add a bookstore.";
  else if (bookstore.length > 120) {
    errors.bookstore = "Keep the bookstore under 120 characters.";
  }

  if (!isbn) errors.isbn = "Add an ISBN.";
  else if (!/^\d{9}[\dX]$/.test(isbn) && !/^\d{13}$/.test(isbn)) {
    errors.isbn = "Use a 10 or 13 digit ISBN.";
  }

  if (!/^\d+$/.test(copiesRaw)) errors.copies = "Copies must be a whole number.";
  const copies = Number(copiesRaw);
  if (!errors.copies && copies > 500) errors.copies = "Keep copies at 500 or fewer.";

  if (Object.keys(errors).length > 0) return { errors };

  return {
    value: {
      title,
      author,
      bookstore,
      isbn,
      copies,
      available: copies > 0 && available,
    },
  };
}
