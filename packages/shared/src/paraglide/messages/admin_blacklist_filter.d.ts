/**
* | output |
* | --- |
* | "Filter blocked numbers..." |
*
* @param {Admin_Blacklist_FilterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_filter: ((inputs?: Admin_Blacklist_FilterInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blacklist_FilterInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blacklist_FilterInputs = {};
