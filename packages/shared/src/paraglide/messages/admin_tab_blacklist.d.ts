/**
* | output |
* | --- |
* | "Blacklist" |
*
* @param {Admin_Tab_BlacklistInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_blacklist: ((inputs?: Admin_Tab_BlacklistInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_BlacklistInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_BlacklistInputs = {};
