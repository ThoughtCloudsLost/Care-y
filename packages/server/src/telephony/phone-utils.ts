import { isValidCountryCode } from "@care-y/shared";
import { ValidationError } from "../errors.js";

/**
 * Country-specific phone number format rules.
 *
 * Each entry describes how to normalize a national phone number:
 * strip a trunk prefix, then validate the resulting digit count.
 * Countries not in this map fall through to generic E.164 bounds (4-15 digits).
 *
 * To add a new country: append one entry here. No other code changes needed.
 */
interface CountryFormat {
  /** National trunk prefix to strip (e.g., "0" for most countries, "1" for NANP). */
  readonly trunkPrefix: string;
  /**
   * If set, only strip the trunk prefix when the raw digit count equals this value.
   * NANP needs this: strip "1" only from 11-digit input (user typed "1-212-555-1234"),
   * not from a 10-digit number that happens to start with 1.
   */
  readonly stripOnlyAtLength?: number;
  /** Minimum valid national digit count (after prefix stripping). */
  readonly minDigits: number;
  /** Maximum valid national digit count (after prefix stripping). */
  readonly maxDigits: number;
  /** Human-readable label for error messages (e.g., "US/CA", "UK"). */
  readonly label: string;
  /** Optional hint appended to error messages (e.g., "e.g., 2125551234"). */
  readonly hint?: string;
}

const COUNTRY_FORMATS: ReadonlyMap<string, CountryFormat> = new Map([
  [
    "+1",
    {
      trunkPrefix: "1",
      stripOnlyAtLength: 11,
      minDigits: 10,
      maxDigits: 10,
      label: "US/CA",
      hint: "e.g., 2125551234",
    },
  ],
  [
    "+44",
    {
      trunkPrefix: "0",
      minDigits: 10,
      maxDigits: 11,
      label: "UK",
      hint: "after removing leading 0",
    },
  ],
  [
    "+61",
    {
      trunkPrefix: "0",
      minDigits: 9,
      maxDigits: 9,
      label: "Australian",
      hint: "after removing leading 0",
    },
  ],
  [
    "+49",
    {
      trunkPrefix: "0",
      minDigits: 3,
      maxDigits: 11,
      label: "German",
      hint: "after removing leading 0",
    },
  ],
]);

function stripNonDigits(input: string): string {
  return input.replace(/\D/g, "");
}

/**
 * Normalizes a phone number to E.164 format.
 *
 * For known country formats (US/CA, UK, AU, DE): strips trunk prefix,
 * validates digit count, then prepends country code.
 * For unknown formats: strips non-digits, prepends country code, validates
 * only against E.164 bounds (4-15 digits).
 *
 * This function is pure and stateless. The country code is passed as an argument
 * (fetched from org_config by the caller).
 */
export function normalizePhoneNumber(raw: string, countryCode: string): string {
  if (!isValidCountryCode(countryCode)) {
    throw new ValidationError(`Unknown country code: ${countryCode}`);
  }

  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new ValidationError("Phone number is required");
  }

  // If already in E.164 format (starts with +), validate and return.
  if (trimmed.startsWith("+")) {
    const digits = stripNonDigits(trimmed);
    if (digits.length < 7 || digits.length > 15) {
      throw new ValidationError("E.164 phone number must be 7-15 digits");
    }
    return "+" + digits;
  }

  let digits = stripNonDigits(trimmed);

  if (digits.length === 0) {
    throw new ValidationError("Phone number contains no digits");
  }

  const format = COUNTRY_FORMATS.get(countryCode);
  if (format) {
    // Strip trunk prefix (conditionally for NANP, unconditionally for others)
    if (digits.startsWith(format.trunkPrefix)) {
      if (
        format.stripOnlyAtLength === undefined ||
        digits.length === format.stripOnlyAtLength
      ) {
        digits = digits.slice(format.trunkPrefix.length);
      }
    }

    // Validate digit count against the format's range
    if (digits.length < format.minDigits || digits.length > format.maxDigits) {
      const range =
        format.minDigits === format.maxDigits
          ? String(format.minDigits)
          : `${String(format.minDigits)}-${String(format.maxDigits)}`;
      const suffix = format.hint !== undefined ? ` (${format.hint})` : "";
      throw new ValidationError(
        `${format.label} phone number must be ${range} digits${suffix}`,
      );
    }
  } else {
    // Generic fallback: no country-specific rules, just E.164 length bounds
    if (digits.length < 4 || digits.length > 15) {
      throw new ValidationError("Phone number must be 4-15 digits");
    }
  }

  return countryCode + digits;
}

/**
 * Validates that a string is already in E.164 format.
 * Does not normalize. Returns true if valid, false otherwise.
 */
export function isE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}
