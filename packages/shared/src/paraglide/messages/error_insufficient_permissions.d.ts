/**
* | output |
* | --- |
* | "You do not have permission to do this." |
*
* @param {Error_Insufficient_PermissionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_insufficient_permissions: ((inputs?: Error_Insufficient_PermissionsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Insufficient_PermissionsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Insufficient_PermissionsInputs = {};
