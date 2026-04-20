/**
* | output |
* | --- |
* | "Tap Add template to create one." |
*
* @param {Admin_Templates_Empty_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_empty_hint: ((inputs?: Admin_Templates_Empty_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Templates_Empty_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Templates_Empty_HintInputs = {};
