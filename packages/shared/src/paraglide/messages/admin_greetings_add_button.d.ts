/**
* | output |
* | --- |
* | "Add greeting" |
*
* @param {Admin_Greetings_Add_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_add_button: ((inputs?: Admin_Greetings_Add_ButtonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Add_ButtonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Add_ButtonInputs = {};
