/**
* | output |
* | --- |
* | "Tap Add greeting to create one." |
*
* @param {Admin_Greetings_Empty_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_empty_hint: ((inputs?: Admin_Greetings_Empty_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Empty_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Empty_HintInputs = {};
