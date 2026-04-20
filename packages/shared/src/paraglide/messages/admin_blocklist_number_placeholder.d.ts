/**
* | output |
* | --- |
* | "555-123-4567" |
*
* @param {Admin_Blocklist_Number_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_number_placeholder: ((inputs?: Admin_Blocklist_Number_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blocklist_Number_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blocklist_Number_PlaceholderInputs = {};
