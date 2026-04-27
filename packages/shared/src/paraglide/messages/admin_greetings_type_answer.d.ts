/**
* | output |
* | --- |
* | "Welcome message" |
*
* @param {Admin_Greetings_Type_AnswerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_answer: ((inputs?: Admin_Greetings_Type_AnswerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Type_AnswerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Type_AnswerInputs = {};
