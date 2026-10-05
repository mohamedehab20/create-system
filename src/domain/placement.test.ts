import assert from "node:assert/strict";
import test from "node:test";
import { buildFloor, roomKeyFor } from "./placement";

test("owners sit in the management office", () => {
  assert.equal(roomKeyFor("التسويق", "owner"), "management");
  assert.equal(roomKeyFor("التصميم", "employee"), "studio");
  assert.equal(roomKeyFor("المبيعات", "employee"), "sales");
  assert.equal(roomKeyFor(null, "employee"), "team");
});

test("the floor keeps people in stored rooms", () => {
  const rooms = buildFloor(
    [
      { id: "1", key: "management", name: "مكتب الإدارة", subtitle: "", href: "/home", sortOrder: 1 },
      { id: "2", key: "studio", name: "الاستوديو", subtitle: "", href: "/work/tasks", sortOrder: 0 },
    ],
    [
      { userId: "a", name: "ليلى", role: "owner", departmentName: "الإدارة" },
      { userId: "b", name: "أحمد", role: "employee", departmentName: "التصميم" },
    ],
  );
  assert.equal(rooms[0].key, "studio");
  assert.deepEqual(rooms[0].people.map((person) => person.name), ["أحمد"]);
  assert.deepEqual(rooms[1].people.map((person) => person.name), ["ليلى"]);
});
