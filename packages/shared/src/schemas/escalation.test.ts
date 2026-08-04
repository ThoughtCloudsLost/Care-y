import { describe, expect, it } from "vitest";
import {
  escalationRuleTypeSchema,
  escalationActionSchema,
  createEscalationRuleInputSchema,
  updateEscalationRuleInputSchema,
  deleteEscalationRuleInputSchema,
  listEscalationRulesInputSchema,
} from "./escalation.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("escalationRuleTypeSchema", () => {
  it("accepts 'unassigned_duration'", () => {
    expect(
      escalationRuleTypeSchema.safeParse("unassigned_duration").success,
    ).toBe(true);
  });

  it("accepts 'inactive_duration'", () => {
    expect(
      escalationRuleTypeSchema.safeParse("inactive_duration").success,
    ).toBe(true);
  });

  it("rejects unknown rule type", () => {
    expect(escalationRuleTypeSchema.safeParse("stale_ticket").success).toBe(
      false,
    );
  });

  it("rejects empty string", () => {
    expect(escalationRuleTypeSchema.safeParse("").success).toBe(false);
  });
});

describe("escalationActionSchema", () => {
  it("accepts 'notify_managers'", () => {
    expect(escalationActionSchema.safeParse("notify_managers").success).toBe(
      true,
    );
  });

  it("accepts 'notify_queue_watchers'", () => {
    expect(
      escalationActionSchema.safeParse("notify_queue_watchers").success,
    ).toBe(true);
  });

  it("rejects unknown action", () => {
    expect(escalationActionSchema.safeParse("reassign").success).toBe(false);
  });
});

describe("createEscalationRuleInputSchema", () => {
  const validInput = {
    queueId: VALID_UUID,
    ruleType: "unassigned_duration",
    thresholdMinutes: 30,
    action: "notify_managers",
  };

  it("accepts valid input", () => {
    const result = createEscalationRuleInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts threshold at minimum (5 minutes)", () => {
    const result = createEscalationRuleInputSchema.safeParse({
      ...validInput,
      thresholdMinutes: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects threshold below 5 minutes", () => {
    const result = createEscalationRuleInputSchema.safeParse({
      ...validInput,
      thresholdMinutes: 4,
    });
    expect(result.success).toBe(false);
  });

  it("rejects threshold of 0", () => {
    const result = createEscalationRuleInputSchema.safeParse({
      ...validInput,
      thresholdMinutes: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative threshold", () => {
    const result = createEscalationRuleInputSchema.safeParse({
      ...validInput,
      thresholdMinutes: -10,
    });
    expect(result.success).toBe(false);
  });

  it("accepts threshold at maximum (90 days in minutes)", () => {
    const result = createEscalationRuleInputSchema.safeParse({
      ...validInput,
      thresholdMinutes: 60 * 24 * 90,
    });
    expect(result.success).toBe(true);
  });

  it("rejects threshold above maximum", () => {
    const result = createEscalationRuleInputSchema.safeParse({
      ...validInput,
      thresholdMinutes: 60 * 24 * 90 + 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer threshold", () => {
    const result = createEscalationRuleInputSchema.safeParse({
      ...validInput,
      thresholdMinutes: 10.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid queueId", () => {
    const result = createEscalationRuleInputSchema.safeParse({
      ...validInput,
      queueId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid ruleType", () => {
    const result = createEscalationRuleInputSchema.safeParse({
      ...validInput,
      ruleType: "unknown_type",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid action", () => {
    const result = createEscalationRuleInputSchema.safeParse({
      ...validInput,
      action: "unknown_action",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(createEscalationRuleInputSchema.safeParse({}).success).toBe(false);
    expect(
      createEscalationRuleInputSchema.safeParse({ queueId: VALID_UUID })
        .success,
    ).toBe(false);
  });
});

describe("updateEscalationRuleInputSchema", () => {
  it("accepts ruleId with thresholdMinutes", () => {
    const result = updateEscalationRuleInputSchema.safeParse({
      ruleId: VALID_UUID,
      thresholdMinutes: 60,
    });
    expect(result.success).toBe(true);
  });

  it("accepts ruleId with action", () => {
    const result = updateEscalationRuleInputSchema.safeParse({
      ruleId: VALID_UUID,
      action: "notify_queue_watchers",
    });
    expect(result.success).toBe(true);
  });

  it("accepts ruleId with isActive", () => {
    const result = updateEscalationRuleInputSchema.safeParse({
      ruleId: VALID_UUID,
      isActive: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts ruleId with all optional fields", () => {
    const result = updateEscalationRuleInputSchema.safeParse({
      ruleId: VALID_UUID,
      thresholdMinutes: 15,
      action: "notify_managers",
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts ruleId alone (no fields to update)", () => {
    const result = updateEscalationRuleInputSchema.safeParse({
      ruleId: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing ruleId", () => {
    const result = updateEscalationRuleInputSchema.safeParse({
      thresholdMinutes: 30,
    });
    expect(result.success).toBe(false);
  });

  it("rejects thresholdMinutes below 5", () => {
    const result = updateEscalationRuleInputSchema.safeParse({
      ruleId: VALID_UUID,
      thresholdMinutes: 3,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid action", () => {
    const result = updateEscalationRuleInputSchema.safeParse({
      ruleId: VALID_UUID,
      action: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteEscalationRuleInputSchema", () => {
  it("accepts valid ruleId", () => {
    const result = deleteEscalationRuleInputSchema.safeParse({
      ruleId: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing ruleId", () => {
    expect(deleteEscalationRuleInputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-uuid ruleId", () => {
    const result = deleteEscalationRuleInputSchema.safeParse({
      ruleId: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("listEscalationRulesInputSchema", () => {
  it("accepts valid queueId", () => {
    const result = listEscalationRulesInputSchema.safeParse({
      queueId: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing queueId", () => {
    expect(listEscalationRulesInputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-uuid queueId", () => {
    const result = listEscalationRulesInputSchema.safeParse({
      queueId: "not-valid",
    });
    expect(result.success).toBe(false);
  });
});
