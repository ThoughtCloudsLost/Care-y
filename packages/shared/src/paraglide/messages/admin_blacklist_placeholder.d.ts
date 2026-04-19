/**
* | output |
* | --- |
* | "Coming in a future update" |
*
* @param {Admin_Blacklist_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_placeholder: ((inputs?: Admin_Blacklist_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blacklist_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blacklist_PlaceholderInputs = {};
