import { describe, expect, it } from "vitest";
import {
  emailSchema,
  notificationEmailSchema,
  passwordSchema,
  displayNameSchema,
  identifierSchema,
  loginInputSchema,
  registerInputSchema,
  setUserActiveInputSchema,
  permissionValueSchema,
  setRolePermissionInputSchema,
  rolePermissionsOutputSchema,
} from "./auth.js";
import { RoleId, Permission } from "../roles.js";

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    const result = emailSchema.safeParse("Carey@Example.COM");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("carey@example.com");
    }
  });

  it("trims whitespace before validating", () => {
    const result = emailSchema.safeParse("  carey@example.com  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("carey@example.com");
    }
  });

  it("rejects invalid email format", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse("@missing-local.com").success).toBe(false);
    expect(emailSchema.safeParse("missing-domain@").success).toBe(false);
  });

  it("rejects email exceeding 254 characters", () => {
    const long = "a".repeat(243) + "@example.com"; // 255 chars
    expect(emailSchema.safeParse(long).success).toBe(false);
  });

  it("accepts email at exactly 254 characters", () => {
    const exact = "a".repeat(242) + "@example.com"; // 254 chars
    expect(emailSchema.safeParse(exact).success).toBe(true);
  });

  it("rejects empty string", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
  });

  it("rejects email with internal spaces", () => {
    expect(emailSchema.safeParse("carey @example.com").success).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(emailSchema.safeParse(123).success).toBe(false);
    expect(emailSchema.safeParse(null).success).toBe(false);
    expect(emailSchema.safeParse(undefined).success).toBe(false);
  });
});

describe("notificationEmailSchema", () => {
  it("accepts a valid email", () => {
    const result = notificationEmailSchema.safeParse("carey@example.com");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("carey@example.com");
    }
  });

  it("accepts undefined", () => {
    const result = notificationEmailSchema.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it("rejects invalid email", () => {
    expect(notificationEmailSchema.safeParse("not-an-email").success).toBe(
      false,
    );
  });
});

describe("passwordSchema", () => {
  it("accepts a 16-character password", () => {
    expect(passwordSchema.safeParse("a".repeat(16)).success).toBe(true);
  });

  it("accepts a 256-character password", () => {
    expect(passwordSchema.safeParse("a".repeat(256)).success).toBe(true);
  });

  it("rejects passwords shorter than 16 characters", () => {
    const result = passwordSchema.safeParse("a".repeat(15));
    expect(result.success).toBe(false);
  });

  it("rejects passwords longer than 256 characters", () => {
    const result = passwordSchema.safeParse("a".repeat(257));
    expect(result.success).toBe(false);
  });

  it("accepts unicode characters (emoji password)", () => {
    // 16 emoji = 16 chars (JS string length), valid
    const emoji = "\u{1F600}".repeat(16);
    expect(passwordSchema.safeParse(emoji).success).toBe(true);
  });

  it("rejects empty string", () => {
    expect(passwordSchema.safeParse("").success).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(passwordSchema.safeParse(12345678901234567).success).toBe(false);
    expect(passwordSchema.safeParse(null).success).toBe(false);
  });

  it("provides a clear error message for too-short passwords", () => {
    const result = passwordSchema.safeParse("short");
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("16"))).toBe(true);
    }
  });
});

describe("displayNameSchema", () => {
  it("accepts a valid name", () => {
    expect(displayNameSchema.safeParse("Alice").success).toBe(true);
  });

  it("trims whitespace", () => {
    const result = displayNameSchema.safeParse("  Bob  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Bob");
    }
  });

  it("rejects empty string", () => {
    expect(displayNameSchema.safeParse("").success).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    expect(displayNameSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects names longer than 100 characters", () => {
    expect(displayNameSchema.safeParse("a".repeat(101)).success).toBe(false);
  });

  it("accepts name at exactly 100 characters", () => {
    expect(displayNameSchema.safeParse("a".repeat(100)).success).toBe(true);
  });

  it("accepts single character after trim", () => {
    expect(displayNameSchema.safeParse("X").success).toBe(true);
  });

  it("accepts unicode names", () => {
    expect(displayNameSchema.safeParse("Ren\u00e9e").success).toBe(true);
    expect(displayNameSchema.safeParse("\u5c0f\u660e").success).toBe(true); // CJK
  });

  it("rejects non-string input", () => {
    expect(displayNameSchema.safeParse(42).success).toBe(false);
    expect(displayNameSchema.safeParse(null).success).toBe(false);
  });
});

describe("identifierSchema", () => {
  it("accepts valid identifiers", () => {
    expect(identifierSchema.safeParse("jane.smith").success).toBe(true);
    expect(identifierSchema.safeParse("jsmith").success).toBe(true);
    expect(identifierSchema.safeParse("volunteer42").success).toBe(true);
    expect(identifierSchema.safeParse("j-s").success).toBe(true);
    expect(identifierSchema.safeParse("a_b").success).toBe(true);
  });

  it("normalizes to lowercase", () => {
    const result = identifierSchema.safeParse("JaneSmith");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("janesmith");
    }
  });

  it("trims whitespace", () => {
    const result = identifierSchema.safeParse("  jsmith  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("jsmith");
    }
  });

  it("rejects identifiers starting with a digit", () => {
    expect(identifierSchema.safeParse("1jane").success).toBe(false);
  });

  it("rejects identifiers starting with a special char", () => {
    expect(identifierSchema.safeParse("@jane").success).toBe(false);
    expect(identifierSchema.safeParse(".jane").success).toBe(false);
    expect(identifierSchema.safeParse("-jane").success).toBe(false);
  });

  it("rejects identifiers ending with a special char", () => {
    expect(identifierSchema.safeParse("jane-").success).toBe(false);
    expect(identifierSchema.safeParse("jane.").success).toBe(false);
    expect(identifierSchema.safeParse("jane_").success).toBe(false);
  });

  it("rejects identifiers with spaces", () => {
    expect(identifierSchema.safeParse("jane smith").success).toBe(false);
  });

  it("rejects identifiers shorter than 3 characters", () => {
    expect(identifierSchema.safeParse("j").success).toBe(false);
    expect(identifierSchema.safeParse("jk").success).toBe(false);
  });

  it("rejects identifiers longer than 64 characters", () => {
    expect(identifierSchema.safeParse("a" + "b".repeat(63) + "c").success).toBe(
      false,
    );
  });

  it("accepts identifier at exactly 64 characters", () => {
    const id = "a" + "b".repeat(62) + "c"; // 64 chars
    expect(identifierSchema.safeParse(id).success).toBe(true);
  });

  it("accepts identifier at exactly 3 characters", () => {
    expect(identifierSchema.safeParse("abc").success).toBe(true);
  });

  it("rejects non-string input", () => {
    expect(identifierSchema.safeParse(123).success).toBe(false);
    expect(identifierSchema.safeParse(null).success).toBe(false);
  });
});

describe("loginInputSchema", () => {
  it("validates a complete login input", () => {
    const result = loginInputSchema.safeParse({
      identifier: "carey",
      password: "securepassword16",
    });
    expect(result.success).toBe(true);
  });

  it("normalizes identifier in login input", () => {
    const result = loginInputSchema.safeParse({
      identifier: "CAREY",
      password: "securepassword16",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.identifier).toBe("carey");
    }
  });

  it("rejects missing identifier", () => {
    const result = loginInputSchema.safeParse({
      password: "securepassword16",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginInputSchema.safeParse({ identifier: "carey" });
    expect(result.success).toBe(false);
  });
});

describe("registerInputSchema", () => {
  it("validates a complete registration input", () => {
    const result = registerInputSchema.safeParse({
      identifier: "carey",
      password: "strongpassword16",
      displayName: "New User",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional notificationEmail", () => {
    const result = registerInputSchema.safeParse({
      identifier: "carey",
      password: "strongpassword16",
      displayName: "New User",
      notificationEmail: "carey@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notificationEmail).toBe("carey@example.com");
    }
  });

  it("accepts missing notificationEmail", () => {
    const result = registerInputSchema.safeParse({
      identifier: "carey",
      password: "strongpassword16",
      displayName: "New User",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notificationEmail).toBeUndefined();
    }
  });

  it("rejects missing displayName", () => {
    const result = registerInputSchema.safeParse({
      identifier: "carey",
      password: "strongpassword16",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password in registration", () => {
    const result = registerInputSchema.safeParse({
      identifier: "carey",
      password: "short",
      displayName: "New User",
    });
    expect(result.success).toBe(false);
  });

  it("strips extra fields from output", () => {
    const result = registerInputSchema.safeParse({
      identifier: "carey",
      password: "strongpassword16",
      displayName: "Carey",
      isAdmin: true,
      role: "superuser",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("isAdmin");
      expect(result.data).not.toHaveProperty("role");
    }
  });
});

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("setUserActiveInputSchema", () => {
  it("accepts valid deactivation input", () => {
    const result = setUserActiveInputSchema.safeParse({
      userId: VALID_UUID,
      isActive: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid activation input", () => {
    const result = setUserActiveInputSchema.safeParse({
      userId: VALID_UUID,
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing userId", () => {
    expect(
      setUserActiveInputSchema.safeParse({ isActive: false }).success,
    ).toBe(false);
  });

  it("rejects missing isActive", () => {
    expect(
      setUserActiveInputSchema.safeParse({ userId: VALID_UUID }).success,
    ).toBe(false);
  });

  it("rejects non-UUID userId", () => {
    expect(
      setUserActiveInputSchema.safeParse({
        userId: "not-a-uuid",
        isActive: false,
      }).success,
    ).toBe(false);
  });

  it("rejects non-boolean isActive", () => {
    expect(
      setUserActiveInputSchema.safeParse({
        userId: VALID_UUID,
        isActive: "false",
      }).success,
    ).toBe(false);
  });
});

describe("permissionValueSchema", () => {
  it("accepts a valid Permission enum value", () => {
    const result = permissionValueSchema.safeParse(Permission.VIEW_TICKETS);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("view_tickets");
    }
  });

  it("accepts all Permission enum values", () => {
    for (const value of Object.values(Permission)) {
      expect(permissionValueSchema.safeParse(value).success).toBe(true);
    }
  });

  it("rejects unknown permission strings", () => {
    expect(permissionValueSchema.safeParse("fly_helicopters").success).toBe(
      false,
    );
    expect(permissionValueSchema.safeParse("MANAGE_KEYS").success).toBe(false);
    expect(permissionValueSchema.safeParse("").success).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(permissionValueSchema.safeParse(42).success).toBe(false);
    expect(permissionValueSchema.safeParse(null).success).toBe(false);
    expect(permissionValueSchema.safeParse(undefined).success).toBe(false);
  });
});

describe("setRolePermissionInputSchema", () => {
  it("accepts valid input", () => {
    const result = setRolePermissionInputSchema.safeParse({
      roleId: RoleId.MANAGER,
      permission: Permission.VIEW_REPORTS,
      enabled: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts enabled=false", () => {
    const result = setRolePermissionInputSchema.safeParse({
      roleId: RoleId.VOLUNTEER,
      permission: Permission.EDIT_KNOWLEDGE_BASE,
      enabled: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown role ids", () => {
    expect(
      setRolePermissionInputSchema.safeParse({
        roleId: "unknown_role_id",
        permission: Permission.VIEW_TICKETS,
        enabled: true,
      }).success,
    ).toBe(false);
  });

  it("rejects unknown permission strings", () => {
    expect(
      setRolePermissionInputSchema.safeParse({
        roleId: RoleId.ADMIN,
        permission: "launch_missiles",
        enabled: true,
      }).success,
    ).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(
      setRolePermissionInputSchema.safeParse({
        roleId: RoleId.ADMIN,
        permission: Permission.VIEW_TICKETS,
      }).success,
    ).toBe(false);

    expect(
      setRolePermissionInputSchema.safeParse({
        roleId: RoleId.ADMIN,
        enabled: true,
      }).success,
    ).toBe(false);

    expect(
      setRolePermissionInputSchema.safeParse({
        permission: Permission.VIEW_TICKETS,
        enabled: true,
      }).success,
    ).toBe(false);
  });

  it("rejects non-boolean enabled", () => {
    expect(
      setRolePermissionInputSchema.safeParse({
        roleId: RoleId.ADMIN,
        permission: Permission.VIEW_TICKETS,
        enabled: "true",
      }).success,
    ).toBe(false);
  });
});

describe("rolePermissionsOutputSchema", () => {
  it("accepts valid output shape", () => {
    const result = rolePermissionsOutputSchema.safeParse({
      roles: [
        {
          roleId: RoleId.VOLUNTEER,
          permissions: [Permission.VIEW_TICKETS, Permission.VIEW_OWN_SHIFTS],
          overridden: [],
        },
        {
          roleId: RoleId.MANAGER,
          permissions: [Permission.VIEW_TICKETS, Permission.MANAGE_USERS],
          overridden: [Permission.MANAGE_USERS],
        },
        {
          roleId: RoleId.ADMIN,
          permissions: [Permission.MANAGE_KEYS, Permission.MANAGE_ROLES],
          overridden: [],
        },
      ],
      locked: [Permission.MANAGE_KEYS, Permission.MANAGE_ROLES],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty roles and locked arrays", () => {
    const result = rolePermissionsOutputSchema.safeParse({
      roles: [],
      locked: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid permission in locked array", () => {
    expect(
      rolePermissionsOutputSchema.safeParse({
        roles: [],
        locked: ["not_a_real_permission"],
      }).success,
    ).toBe(false);
  });

  it("rejects invalid role id in roles array", () => {
    expect(
      rolePermissionsOutputSchema.safeParse({
        roles: [
          {
            roleId: "bad_role",
            permissions: [],
            overridden: [],
          },
        ],
        locked: [],
      }).success,
    ).toBe(false);
  });
});
