/**
 * Exposure system contextual hints for volunteer management actions.
 */

export const EXPOSURE_HINT_ADD_VOLUNTEER =
  "This person will be able to read decrypted client data for any ticket " +
  "they are assigned to. That data covers names, phone numbers, messages, " +
  "and case notes. They can also export or copy it outside of CARE-Y. " +
  "Only add people you trust with your clients' safety.";

export const EXPOSURE_HINT_REMOVE_VOLUNTEER =
  "This volunteer can no longer access new tickets. They have already " +
  "seen decrypted content for tickets they were previously assigned to. " +
  "That access cannot be undone.";
