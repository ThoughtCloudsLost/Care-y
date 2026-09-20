/**
* | output |
* | --- |
* | "Cannot deactivate the last admin." |
*
* @param {Error_Cannot_Deactivate_Last_AdminInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_cannot_deactivate_last_admin: ((inputs?: Error_Cannot_Deactivate_Last_AdminInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Cannot_Deactivate_Last_AdminInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Cannot_Deactivate_Last_AdminInputs = {};
