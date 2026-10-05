import assert from "node:assert/strict";
import test from "node:test";
import { can } from "./can";

const company = "company-1";

test("an employee cannot see another company's data", () => {
  assert.equal(can({ userId: "u", companyId: company, role: "employee" }, "view", { type: "project", companyId: "other" }), false);
});

test("finance amounts stay with management", () => {
  assert.equal(can({ userId: "u", companyId: company, role: "employee" }, "view", { type: "finance", companyId: company }), false);
  assert.equal(can({ userId: "u", companyId: company, role: "manager" }, "view", { type: "finance", companyId: company }), true);
  assert.equal(can({ userId: "u", companyId: company, role: "manager" }, "create", { type: "finance", companyId: company }), false);
  assert.equal(can({ userId: "u", companyId: company, role: "owner" }, "create", { type: "finance", companyId: company }), true);
});

test("only the assignee employee can update a task", () => {
  const actor = { userId: "employee", companyId: company, role: "employee" as const };
  assert.equal(can(actor, "update", { type: "task", companyId: company, assigneeId: "someone" }), false);
  assert.equal(can(actor, "update", { type: "task", companyId: company, assigneeId: "employee" }), true);
  assert.equal(can(actor, "delete", { type: "task", companyId: company }), false);
});

test("export is closed in the first version", () => {
  assert.equal(can({ userId: "u", companyId: company, role: "owner" }, "export", { type: "company", companyId: company }), false);
});

test("only the owner edits company identity", () => {
  assert.equal(can({ userId: "u", companyId: company, role: "admin" }, "update", { type: "company", companyId: company }), false);
  assert.equal(can({ userId: "u", companyId: company, role: "owner" }, "update", { type: "company", companyId: company }), true);
});
