// @vitest-environment jsdom
import { describe, it, expect, vi, type Mock } from "vitest";
import {
  kbCategoryIdSchema,
  queueIdSchema,
  userIdSchema,
  type DashboardActivityFilter,
  type DashboardKbFilter,
  type DashboardMergeFilter,
} from "@care-y/shared";
import { createFilterDispatch } from "$lib/composables/create-filter-dispatch.svelte.js";
import {
  activityActiveCount,
  activityFilterFields,
  activityQueryFilter,
  buildActivityFilterPills,
  buildKbFilterPills,
  buildMergeFilterPills,
  emptyActivityFilter,
  emptyKbFilter,
  emptyMergeFilter,
  filterMergeCandidates,
  kbActiveCount,
  kbFilterFields,
  kbQueryFilter,
  mergeActiveCount,
  mergeFilterFields,
  toggleListValue,
  type SectionFilterAccess,
} from "./section-filters.js";

const QUEUE = queueIdSchema.parse("00000000-0000-4000-8000-0000000000a1");
const CATEGORY_1 = kbCategoryIdSchema.parse(
  "00000000-0000-4000-8000-0000000000c1",
);
const CATEGORY_2 = kbCategoryIdSchema.parse(
  "00000000-0000-4000-8000-0000000000c2",
);
const AUTHOR = userIdSchema.parse("00000000-0000-4000-8000-0000000000d1");

/** A filter held in a local box, standing in for the document. */
function access<F>(initial: F): SectionFilterAccess<F> & {
  readonly set: Mock<(filter: F) => void>;
  current(): F;
} {
  let value = initial;
  const set = vi.fn((filter: F) => {
    value = filter;
  });
  return { get: () => value, set, current: () => value };
}

describe("toggleListValue", () => {
  it("adds a missing value and removes a present one", () => {
    expect(toggleListValue(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleListValue(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("activity filters", () => {
  it("starts empty", () => {
    expect(emptyActivityFilter()).toEqual({ kinds: [], queueIds: [] });
    expect(activityActiveCount(emptyActivityFilter())).toBe(0);
  });

  it("counts each active dimension once", () => {
    expect(
      activityActiveCount({ kinds: ["ticket", "org"], queueIds: [QUEUE] }),
    ).toBe(2);
  });

  it("leaves empty dimensions out of the query input", () => {
    expect(activityQueryFilter(emptyActivityFilter())).toEqual({});
    expect(activityQueryFilter({ kinds: ["org"], queueIds: [] })).toEqual({
      kinds: ["org"],
    });
  });

  it("builds kind and queue pills with the selection", () => {
    const pills = buildActivityFilterPills(
      { kinds: ["org"], queueIds: [QUEUE] },
      [{ id: QUEUE, name: "Intake" }],
      false,
    );
    expect(pills.map((p) => p.id)).toEqual(["kind", "queue"]);
    expect(pills[0]?.options.map((o) => o.value)).toEqual(["ticket", "org"]);
    expect(pills[0]?.selected).toEqual(new Set(["org"]));
    expect(pills[1]?.options).toEqual([{ value: QUEUE, label: "Intake" }]);
    expect(pills[1]?.selected).toEqual(new Set([QUEUE]));
  });

  it("writes toggles through to the document and ignores unknown values", () => {
    const doc = access<DashboardActivityFilter>(emptyActivityFilter());
    const dispatch = createFilterDispatch({
      fields: activityFilterFields(doc),
      clearAll: () => {
        doc.set(emptyActivityFilter());
      },
    });

    dispatch.handlePillToggle("kind", "ticket");
    dispatch.handlePillToggle("kind", "not-a-kind");
    dispatch.handlePillToggle("queue", "q-1");
    dispatch.handlePillToggle("queue", QUEUE);
    expect(doc.current()).toEqual({ kinds: ["ticket"], queueIds: [QUEUE] });

    dispatch.handlePillToggle("kind", "ticket");
    expect(doc.current().kinds).toEqual([]);

    dispatch.clearAll();
    expect(doc.current()).toEqual(emptyActivityFilter());
  });
});

describe("KB filters", () => {
  it("counts categories and author as one dimension each", () => {
    expect(kbActiveCount(emptyKbFilter())).toBe(0);
    expect(
      kbActiveCount({
        categoryIds: [CATEGORY_1, CATEGORY_2],
        createdBy: AUTHOR,
      }),
    ).toBe(2);
  });

  it("leaves empty dimensions out of the query input", () => {
    expect(kbQueryFilter(emptyKbFilter())).toEqual({});
    expect(
      kbQueryFilter({ categoryIds: [CATEGORY_1], createdBy: AUTHOR }),
    ).toEqual({
      categoryIds: [CATEGORY_1],
      createdBy: AUTHOR,
    });
  });

  it("builds category and author pills, leaving undecrypted authors out", () => {
    const pills = buildKbFilterPills(
      { categoryIds: [CATEGORY_1], createdBy: AUTHOR },
      [
        { id: CATEGORY_1, name: "Housing" },
        { id: CATEGORY_2, name: null },
      ],
      false,
      [
        { id: AUTHOR, name: "Robin" },
        { id: "u-2", name: null },
      ],
    );
    expect(pills.map((p) => [p.id, p.mode])).toEqual([
      ["category", "multi"],
      ["author", "single"],
    ]);
    expect(pills[0]?.options.map((o) => o.label)).toEqual(["Housing", "..."]);
    expect(pills[0]?.selected).toEqual(new Set([CATEGORY_1]));
    expect(pills[1]?.options).toEqual([{ value: AUTHOR, label: "Robin" }]);
    expect(pills[1]?.selected).toBe(AUTHOR);
  });

  it("writes toggles and the author through, ignoring malformed categories", () => {
    const doc = access<DashboardKbFilter>(emptyKbFilter());
    const dispatch = createFilterDispatch({
      fields: kbFilterFields(doc),
      clearAll: () => {
        doc.set(emptyKbFilter());
      },
    });

    dispatch.handlePillToggle("category", "c-1");
    dispatch.handlePillToggle("category", CATEGORY_1);
    dispatch.handlePillToggle("category", CATEGORY_2);
    dispatch.handlePillSelect("author", AUTHOR);
    expect(doc.current()).toEqual({
      categoryIds: [CATEGORY_1, CATEGORY_2],
      createdBy: AUTHOR,
    });

    dispatch.handlePillSelect("author", null);
    expect(doc.current().createdBy).toBeNull();
  });
});

describe("merge filters", () => {
  const PAIRS = [
    { id: "p-phone", matchKind: "phone" as const },
    { id: "p-email", matchKind: "email" as const },
  ];

  it("keeps every candidate without a filter", () => {
    expect(filterMergeCandidates(PAIRS, emptyMergeFilter())).toBe(PAIRS);
    expect(mergeActiveCount(emptyMergeFilter())).toBe(0);
  });

  it("keeps the candidates matched the selected way", () => {
    expect(
      filterMergeCandidates(PAIRS, { matchKinds: ["email"] }).map((p) => p.id),
    ).toEqual(["p-email"]);
    expect(mergeActiveCount({ matchKinds: ["email"] })).toBe(1);
  });

  it("builds a match pill named like the candidate list", () => {
    const [pill] = buildMergeFilterPills({ matchKinds: ["phone"] });
    expect(pill?.options).toEqual([
      { value: "phone", label: "Same phone number" },
      { value: "email", label: "Same email address" },
    ]);
    expect(pill?.selected).toEqual(new Set(["phone"]));
  });

  it("writes toggles through to the document and ignores unknown kinds", () => {
    const doc = access<DashboardMergeFilter>(emptyMergeFilter());
    const dispatch = createFilterDispatch({
      fields: mergeFilterFields(doc),
      clearAll: () => {
        doc.set(emptyMergeFilter());
      },
    });
    dispatch.handlePillToggle("match", "phone");
    dispatch.handlePillToggle("match", "fax");
    expect(doc.current()).toEqual({ matchKinds: ["phone"] });
  });
});
