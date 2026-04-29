/**
* | output |
* | --- |
* | "Your role does not have access to this note type." |
*
* @param {Error_Insufficient_RoleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_insufficient_role: ((inputs?: Error_Insufficient_RoleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Insufficient_RoleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Insufficient_RoleInputs = {};
