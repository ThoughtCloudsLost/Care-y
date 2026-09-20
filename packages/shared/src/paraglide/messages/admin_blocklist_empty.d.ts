/**
* | output |
* | --- |
* | "No blocked numbers yet." |
*
* @param {Admin_Blocklist_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_empty: ((inputs?: Admin_Blocklist_EmptyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blocklist_EmptyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blocklist_EmptyInputs = {};
