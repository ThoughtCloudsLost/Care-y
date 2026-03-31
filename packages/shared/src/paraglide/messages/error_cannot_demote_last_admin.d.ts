/**
* | output |
* | --- |
* | "Cannot demote the last admin." |
*
* @param {Error_Cannot_Demote_Last_AdminInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_cannot_demote_last_admin: ((inputs?: Error_Cannot_Demote_Last_AdminInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Cannot_Demote_Last_AdminInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Cannot_Demote_Last_AdminInputs = {};
