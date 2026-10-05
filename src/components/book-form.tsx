"use client";

import { useId, useState } from "react";
import {
  parseBookForm,
  type BookFormErrors,
  type BookInput,
} from "@/lib/books";

const FIELDS = [
  { name: "title", label: "Title", placeholder: "يوتوبيا", auto: "off" },
  {
    name: "author",
    label: "Author",
    placeholder: "أحمد خالد توفيق",
    auto: "off",
  },
  {
    name: "bookstore",
    label: "Bookstore",
    placeholder: "Shorock Store",
    auto: "organization",
  },
  {
    name: "isbn",
    label: "ISBN",
    placeholder: "9770933074",
    auto: "off",
    mono: true,
  },
] as const;

export function BookForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: BookInput;
  submitLabel: string;
  onSubmit: (value: BookInput) => void;
}) {
  const formId = useId();
  const [errors, setErrors] = useState<BookFormErrors>({});

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = parseBookForm(new FormData(event.currentTarget));
        if ("errors" in parsed) {
          setErrors(parsed.errors);
          return;
        }
        setErrors({});
        onSubmit(parsed.value);
      }}
    >
      {FIELDS.map((field) => {
        const error = errors[field.name];
        const inputId = `${formId}-${field.name}`;
        return (
          <label key={field.name} htmlFor={inputId} className="grid gap-1.5">
            <span className="text-sm font-medium">{field.label}</span>
            <input
              id={inputId}
              name={field.name}
              defaultValue={initial?.[field.name] ?? ""}
              placeholder={field.placeholder}
              autoComplete={field.auto}
              dir="auto"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${inputId}-error` : undefined}
              className={`rounded-lg border border-line bg-card px-3 py-2.5 text-ink placeholder:text-ink-soft/70 ${
                "mono" in field ? "font-mono tracking-wide" : ""
              }`}
            />
            {error ? (
              <span id={`${inputId}-error`} className="text-sm text-burgundy">
                {error}
              </span>
            ) : null}
          </label>
        );
      })}

      <label htmlFor={`${formId}-copies`} className="grid gap-1.5">
        <span className="text-sm font-medium">Copies</span>
        <input
          id={`${formId}-copies`}
          name="copies"
          type="number"
          min={0}
          max={500}
          step={1}
          inputMode="numeric"
          defaultValue={initial?.copies ?? 1}
          aria-invalid={errors.copies ? true : undefined}
          aria-describedby={
            errors.copies ? `${formId}-copies-error` : `${formId}-copies-hint`
          }
          className="w-32 rounded-lg border border-line bg-card px-3 py-2.5"
        />
        {errors.copies ? (
          <span id={`${formId}-copies-error`} className="text-sm text-burgundy">
            {errors.copies}
          </span>
        ) : (
          <span id={`${formId}-copies-hint`} className="text-sm text-ink-soft">
            Zero copies keeps the title off the shelf.
          </span>
        )}
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          name="available"
          type="checkbox"
          defaultChecked={initial?.available ?? true}
          className="size-4 accent-burgundy"
        />
        On the shelf and available to lend
      </label>

      <div>
        <button
          type="submit"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-card hover:bg-forest"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
