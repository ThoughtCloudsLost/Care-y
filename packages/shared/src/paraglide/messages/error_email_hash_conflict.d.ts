/**
* | output |
* | --- |
* | "That email address belongs to another {client}." |
*
* @param {Error_Email_Hash_ConflictInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_email_hash_conflict: ((inputs: Error_Email_Hash_ConflictInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Email_Hash_ConflictInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Email_Hash_ConflictInputs = {
    client: NonNullable<unknown>;
};
