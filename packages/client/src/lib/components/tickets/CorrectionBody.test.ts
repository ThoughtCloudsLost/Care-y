// @vitest-environment jsdom
/**
 * CorrectionBody tests.
 *
 * Covers: phone-only rendering, email-only rendering, both fields,
 * apply-phone action visibility, and apply callback.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { tick } from "svelte";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import CorrectionBody from "./CorrectionBody.svelte";
import type * as MessagesMod from "$lib/paraglide/messages.js";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesMod>()),
  correction_body_new_phone: () => "New phone",
  correction_body_new_email: () => "New email",
  correction_body_apply_phone: () => "Apply phone",
  correction_body_apply_email: () => "Apply email",
}));

afterEach(cleanup);

describe("CorrectionBody", () => {
  it("renders phone row when payload has phone", () => {
    const { getByTestId } = render(CorrectionBody, {
      props: { payload: { v: 1, phone: "+15551234567" } },
    });
    const row = getByTestId("correction-row-phone");
    expect(row.textContent).toContain("New phone");
    expect(row.textContent).toContain("+15551234567");
  });

  it("renders email row when payload has email", () => {
    const { getByTestId } = render(CorrectionBody, {
      props: { payload: { v: 1, email: "user@example.com" } },
    });
    const row = getByTestId("correction-row-email");
    expect(row.textContent).toContain("New email");
    expect(row.textContent).toContain("user@example.com");
  });

  it("renders both rows when payload has phone and email", () => {
    const { getByTestId } = render(CorrectionBody, {
      props: {
        payload: { v: 1, phone: "+15551234567", email: "user@example.com" },
      },
    });
    expect(getByTestId("correction-row-phone")).toBeTruthy();
    expect(getByTestId("correction-row-email")).toBeTruthy();
  });

  it("shows apply button when phone and onapplyphone are present", () => {
    const { getByTestId } = render(CorrectionBody, {
      props: {
        payload: { v: 1, phone: "+15551234567" },
        onapplyphone: vi.fn(),
      },
    });
    expect(getByTestId("correction-apply-phone")).toBeTruthy();
  });

  it("does not show apply button when onapplyphone is absent", () => {
    const { queryByTestId } = render(CorrectionBody, {
      props: { payload: { v: 1, phone: "+15551234567" } },
    });
    expect(queryByTestId("correction-apply-phone")).toBeNull();
  });

  it("does not show apply button when payload has no phone", () => {
    const { queryByTestId } = render(CorrectionBody, {
      props: {
        payload: { v: 1, email: "user@example.com" },
        onapplyphone: vi.fn(),
      },
    });
    expect(queryByTestId("correction-apply-phone")).toBeNull();
  });

  it("calls onapplyphone with the phone value on click", async () => {
    const onapplyphone = vi.fn();
    const { getByTestId } = render(CorrectionBody, {
      props: {
        payload: { v: 1, phone: "+15551234567" },
        onapplyphone,
      },
    });
    await fireEvent.click(getByTestId("correction-apply-phone"));
    await tick();
    expect(onapplyphone).toHaveBeenCalledWith("+15551234567");
  });

  it("shows email apply button when email and onapplyemail are present", () => {
    const { getByTestId } = render(CorrectionBody, {
      props: {
        payload: { v: 1, email: "user@example.com" },
        onapplyemail: vi.fn(),
      },
    });
    expect(getByTestId("correction-apply-email")).toBeTruthy();
  });

  it("does not show email apply button when onapplyemail is absent", () => {
    const { queryByTestId } = render(CorrectionBody, {
      props: { payload: { v: 1, email: "user@example.com" } },
    });
    expect(queryByTestId("correction-apply-email")).toBeNull();
  });

  it("does not show email apply button when payload has no email", () => {
    const { queryByTestId } = render(CorrectionBody, {
      props: {
        payload: { v: 1, phone: "+15551234567" },
        onapplyemail: vi.fn(),
      },
    });
    expect(queryByTestId("correction-apply-email")).toBeNull();
  });

  it("calls onapplyemail with the email value on click", async () => {
    const onapplyemail = vi.fn();
    const { getByTestId } = render(CorrectionBody, {
      props: {
        payload: { v: 1, email: "user@example.com" },
        onapplyemail,
      },
    });
    await fireEvent.click(getByTestId("correction-apply-email"));
    await tick();
    expect(onapplyemail).toHaveBeenCalledWith("user@example.com");
  });

  it("shows both apply buttons when both callbacks and fields exist", () => {
    const { getByTestId } = render(CorrectionBody, {
      props: {
        payload: { v: 1, phone: "+15551234567", email: "user@example.com" },
        onapplyphone: vi.fn(),
        onapplyemail: vi.fn(),
      },
    });
    expect(getByTestId("correction-apply-phone")).toBeTruthy();
    expect(getByTestId("correction-apply-email")).toBeTruthy();
  });
});
