/**
* | output |
* | --- |
* | "You cannot change your own role." |
*
* @param {Error_Cannot_Change_Own_RoleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_cannot_change_own_role: ((inputs?: Error_Cannot_Change_Own_RoleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Cannot_Change_Own_RoleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Cannot_Change_Own_RoleInputs = {};
