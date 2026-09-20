/**
* | output |
* | --- |
* | "That email address belongs to another {client}." |
*
* @param {Error_Email_Hash_ConflictInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_email_hash_conflict: ((inputs: Error_Email_Hash_ConflictInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Email_Hash_ConflictInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Email_Hash_ConflictInputs = {
    client: NonNullable<unknown>;
};
