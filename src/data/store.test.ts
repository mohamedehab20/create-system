import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const file = path.join(os.tmpdir(), `maqr-${process.pid}.sqlite`);
process.env.MAQR_DB = file;
fs.rmSync(file, { force: true });

test("a company cannot see another company's projects", async () => {
  const { foundCompany, insertUser, listProjects, createProject, listRooms } = await import("./store");
  const ownerA = insertUser({ name: "ليلى", email: "layla@example.com", passwordHash: "x" });
  const ownerB = insertUser({ name: "عمر", email: "omar@example.com", passwordHash: "x" });
  const companyA = foundCompany(ownerA, "ليلى", {
    name: "استوديو",
    industry: "تقنية",
    size: "6-15",
    country: "مصر",
    currency: "EGP",
    website: "",
    description: "",
    template: "startup",
    title: "المؤسس",
  });
  const companyB = foundCompany(ownerB, "عمر", {
    name: "وكالة",
    industry: "تسويق",
    size: "1-5",
    country: "السعودية",
    currency: "SAR",
    website: "",
    description: "",
    template: "agency",
    title: "المؤسس",
  });
  createProject({ companyId: companyA, actorId: ownerA, actorName: "ليلى", name: "إطلاق", description: "", budgetCents: 0 });
  assert.equal(listProjects(companyB).length, 0);
  assert.equal(listProjects(companyA)[0].name, "إطلاق");
  assert.equal(listRooms(companyA).length, 10);
  assert.equal(listRooms(companyA).some((room) => room.key === "management"), true);
});
