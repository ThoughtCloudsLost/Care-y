/**
* | output |
* | --- |
* | "A deletion request for this organization is already in progress." |
*
* @param {Error_Deletion_Already_RequestedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_deletion_already_requested: ((inputs?: Error_Deletion_Already_RequestedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Deletion_Already_RequestedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Deletion_Already_RequestedInputs = {};
