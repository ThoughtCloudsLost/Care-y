/**
* | output |
* | --- |
* | "Enter the greeting text..." |
*
* @param {Admin_Greetings_Text_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_text_placeholder: ((inputs?: Admin_Greetings_Text_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Text_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Text_PlaceholderInputs = {};
