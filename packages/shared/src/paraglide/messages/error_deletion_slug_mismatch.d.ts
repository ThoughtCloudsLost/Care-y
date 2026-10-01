/**
* | output |
* | --- |
* | "The confirmation does not match the organization's address exactly." |
*
* @param {Error_Deletion_Slug_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_deletion_slug_mismatch: ((inputs?: Error_Deletion_Slug_MismatchInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Deletion_Slug_MismatchInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Deletion_Slug_MismatchInputs = {};
