/**
* | output |
* | --- |
* | "Blocklist" |
*
* @param {Admin_Tab_BlocklistInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_blocklist: ((inputs?: Admin_Tab_BlocklistInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_BlocklistInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_BlocklistInputs = {};
