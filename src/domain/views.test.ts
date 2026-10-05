import assert from "node:assert/strict";
import test from "node:test";
import { attentionItems, formatMoney, moneyTotals, operationsMatrix } from "./views";

test("money formatting keeps latin digits", () => {
  assert.equal(formatMoney(150000, "EGP"), "1,500.00 ج.م");
});

test("operations average progress by department", () => {
  const cells = operationsMatrix(
    [{ id: "p", name: "إطلاق" }],
    [
      { projectId: "p", departmentName: "الهندسة", progress: 50 },
      { projectId: "p", departmentName: "الهندسة", progress: 100 },
      { projectId: "p", departmentName: null, progress: 0 },
    ],
  );
  assert.equal(cells.find((cell) => cell.departmentName === "الهندسة")?.progress, 75);
  assert.equal(cells.find((cell) => cell.departmentName === "بدون قسم")?.taskCount, 1);
});

test("monthly totals ignore other months", () => {
  const totals = moneyTotals(
    [
      { type: "revenue", amountCents: 1000, createdAt: "2026-10-02T00:00:00.000Z" },
      { type: "expense", amountCents: 400, createdAt: "2026-10-03T00:00:00.000Z" },
      { type: "expense", amountCents: 50, createdAt: "2026-09-03T00:00:00.000Z" },
    ],
    "2026-10",
  );
  assert.equal(totals.net, 600);
});

test("attention lists overdue work", () => {
  const items = attentionItems([{ id: "t", title: "العقد", status: "progress", dueDate: "2026-01-01" }], "2026-10-05", 0);
  assert.equal(items[0].href, "/work/tasks/t");
});
