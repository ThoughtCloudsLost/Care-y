// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/svelte";

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", () => ({
  library_category_sheet_title: () => "Manage Categories",
  library_category_name: () => "Name",
  library_category_description: () => "Description",
  library_category_save: () => "Save",
  library_category_save_label: () => "Save category",
  library_category_delete: () => "Delete Category",
  library_category_delete_blocked: () =>
    "Move or delete all articles in this category first",
  library_category_created: () => "Category created",
  library_category_updated: () => "Category updated",
  library_category_deleted: () => "Category deleted",
  library_category_edit: () => "Edit",
  library_category_add: () => "Add Category",
  library_category_articles: ({ count }: { count: string }) =>
    `${count} articles`,
  library_category_name_required: () => "Category name is required",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
}));

// --- Hoisted mock fns (vi.mock factories are hoisted above variable decls) ---
const {
  mockEncrypt,
  mockCreateCategory,
  mockUpdateCategory,
  mockDeleteCategory,
  mockInvalidateQueries,
  mockToastShow,
} = vi.hoisted(() => ({
  mockEncrypt: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3, 4])),
  mockCreateCategory: vi.fn().mockResolvedValue({}),
  mockUpdateCategory: vi.fn().mockResolvedValue({}),
  mockDeleteCategory: vi.fn().mockResolvedValue({}),
  mockInvalidateQueries: vi.fn(),
  mockToastShow: vi.fn(),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: () => ({
    encrypt: mockEncrypt,
    decrypt: vi.fn(),
    isLoaded: true,
    load: vi.fn(),
    zero: vi.fn(),
  }),
}));

// --- Mock buffer encoding ---
vi.mock("$lib/utils/buffer-encoding.js", () => ({
  uint8ArrayToBase64: vi.fn().mockReturnValue("AQIDBA=="),
}));

// --- Mock TanStack Query ---
vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// --- Mock tRPC ---
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    kb: {
      createCategory: { mutate: mockCreateCategory },
      updateCategory: { mutate: mockUpdateCategory },
      deleteCategory: { mutate: mockDeleteCategory },
    },
  },
}));

// --- Mock errors ---
vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
}));

// --- Mock toast store ---
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));

// --- Mock haptic ---
vi.mock("$lib/utils/haptic.js", () => ({
  haptic: vi.fn(),
}));

// --- Mock ShellSheet: pass-through ---
vi.mock("$lib/shell/ShellSheet.svelte", async () => ({
  default: (await import("../tickets/test-helpers/PassthroughShell.svelte"))
    .default,
}));

import CategoryManageSheet from "./CategoryManageSheet.svelte";

describe("CategoryManageSheet", () => {
  const ondismiss = vi.fn();

  const categories = [
    {
      id: "cat-1",
      name: "Procedures",
      description: "Standard procedures",
      articleCount: 5,
    },
    { id: "cat-2", name: "Resources", description: null, articleCount: 3 },
    { id: "cat-3", name: "Empty", description: null, articleCount: 0 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("renders category names and article counts", () => {
    render(CategoryManageSheet, {
      opened: true,
      categories,
      ondismiss,
    });

    expect(screen.getByText("Procedures")).toBeTruthy();
    expect(screen.getByText("Resources")).toBeTruthy();
    expect(screen.getByText("Empty")).toBeTruthy();
    expect(screen.getByText("5 articles")).toBeTruthy();
    expect(screen.getByText("3 articles")).toBeTruthy();
    expect(screen.getByText("0 articles")).toBeTruthy();
  });

  it("renders sheet title", () => {
    render(CategoryManageSheet, {
      opened: true,
      categories,
      ondismiss,
    });

    expect(screen.getByText("Manage Categories")).toBeTruthy();
  });

  it("renders Add Category button", () => {
    render(CategoryManageSheet, {
      opened: true,
      categories,
      ondismiss,
    });

    expect(screen.getByText("Add Category")).toBeTruthy();
  });

  it("shows toast when trying to delete category with articles", async () => {
    render(CategoryManageSheet, {
      opened: true,
      categories,
      ondismiss,
    });

    // Click edit on the category with articles
    const editButtons = screen.getAllByLabelText("Edit");
    await fireEvent.click(editButtons[0]!);

    // Now the delete button should be visible
    const deleteBtn = screen.getByText("Delete Category");
    await fireEvent.click(deleteBtn);

    expect(mockToastShow).toHaveBeenCalledWith(
      "Move or delete all articles in this category first",
      3000,
    );
    expect(mockDeleteCategory).not.toHaveBeenCalled();
  });

  it("calls createCategory mutation with encrypted name on add", async () => {
    render(CategoryManageSheet, {
      opened: true,
      categories,
      ondismiss,
    });

    // Click Add Category
    await fireEvent.click(screen.getByText("Add Category"));

    // Fill in the name input
    const nameInputs = document.querySelectorAll("input");
    const nameInput = nameInputs[0];
    expect(nameInput).toBeTruthy();
    await fireEvent.input(nameInput!, { target: { value: "New Category" } });

    // Click Save
    const saveBtn = screen.getByText("Save");
    await fireEvent.click(saveBtn);

    expect(mockEncrypt).toHaveBeenCalled();
    expect(mockCreateCategory).toHaveBeenCalledWith({
      encryptedName: "AQIDBA==",
      encryptedDescription: undefined,
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["kb", "categories"],
    });
  });

  it("calls deleteCategory for category with zero articles", async () => {
    render(CategoryManageSheet, {
      opened: true,
      categories,
      ondismiss,
    });

    // Click edit on the empty category (third one)
    const editButtons = screen.getAllByLabelText("Edit");
    await fireEvent.click(editButtons[2]!);

    // Click Delete Category
    const deleteBtn = screen.getByText("Delete Category");
    await fireEvent.click(deleteBtn);

    expect(mockDeleteCategory).toHaveBeenCalledWith({ categoryId: "cat-3" });
  });

  it("calls updateCategory with encrypted name when editing existing category", async () => {
    render(CategoryManageSheet, {
      opened: true,
      categories,
      ondismiss,
    });

    // Click edit on first category
    const editButtons = screen.getAllByLabelText("Edit");
    await fireEvent.click(editButtons[0]!);

    // The name input should be pre-populated
    const nameInput = document.querySelector("input");
    expect(nameInput).toBeTruthy();
    expect(nameInput!.value).toBe("Procedures");

    // Change the name
    await fireEvent.input(nameInput!, { target: { value: "Updated Name" } });

    // Click Save
    await fireEvent.click(screen.getByText("Save"));

    expect(mockUpdateCategory).toHaveBeenCalledWith({
      categoryId: "cat-1",
      encryptedName: "AQIDBA==",
      encryptedDescription: "AQIDBA==",
    });
  });

  it("pre-populates description when editing a category that has one", async () => {
    render(CategoryManageSheet, {
      opened: true,
      categories,
      ondismiss,
    });

    // Click edit on first category (has description "Standard procedures")
    const editButtons = screen.getAllByLabelText("Edit");
    await fireEvent.click(editButtons[0]!);

    // The textarea should be pre-populated with the existing description
    const textarea = document.querySelector("textarea");
    expect(textarea).toBeTruthy();
    expect(textarea!.value).toBe("Standard procedures");
  });

  it("cancel button closes edit form and restores list view", async () => {
    render(CategoryManageSheet, {
      opened: true,
      categories,
      ondismiss,
    });

    // Click edit
    const editButtons = screen.getAllByLabelText("Edit");
    await fireEvent.click(editButtons[0]!);

    // Verify edit form is visible (Save button present)
    expect(screen.getByText("Save")).toBeTruthy();

    // Click Cancel
    await fireEvent.click(screen.getByText("Cancel"));

    // Edit form should be gone, list item should be back
    expect(screen.queryByText("Save")).toBeNull();
    expect(screen.getByText("Procedures")).toBeTruthy();
  });

  it("shows delete-blocked toast when server rejects delete", async () => {
    // Server rejects even though client thinks articleCount is 0
    mockDeleteCategory.mockRejectedValueOnce(new Error("FK violation"));

    render(CategoryManageSheet, {
      opened: true,
      categories,
      ondismiss,
    });

    // Click edit on empty category
    const editButtons = screen.getAllByLabelText("Edit");
    await fireEvent.click(editButtons[2]!);

    // Click Delete
    await fireEvent.click(screen.getByText("Delete Category"));

    // Wait for the async rejection to resolve
    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        "Move or delete all articles in this category first",
        3000,
      );
    });
  });

  it("shows generic error toast when create mutation fails", async () => {
    mockCreateCategory.mockRejectedValueOnce(new Error("Network error"));

    render(CategoryManageSheet, {
      opened: true,
      categories,
      ondismiss,
    });

    await fireEvent.click(screen.getByText("Add Category"));

    const nameInput = document.querySelector("input");
    await fireEvent.input(nameInput!, { target: { value: "New" } });
    await fireEvent.click(screen.getByText("Save"));

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Something went wrong", 3000);
    });
  });
});
