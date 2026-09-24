/**
* | output |
* | --- |
* | "You do not have permission to do this." |
*
* @param {Error_Insufficient_PermissionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_insufficient_permissions: ((inputs?: Error_Insufficient_PermissionsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Insufficient_PermissionsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Insufficient_PermissionsInputs = {};
