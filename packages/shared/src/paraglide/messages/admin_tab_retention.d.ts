/**
* | output |
* | --- |
* | "Retention" |
*
* @param {Admin_Tab_RetentionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_retention: ((inputs?: Admin_Tab_RetentionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_RetentionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_RetentionInputs = {};
