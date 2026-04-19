/**
* | output |
* | --- |
* | "555-123-4567" |
*
* @param {Admin_Blacklist_Number_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_number_placeholder: ((inputs?: Admin_Blacklist_Number_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blacklist_Number_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blacklist_Number_PlaceholderInputs = {};
