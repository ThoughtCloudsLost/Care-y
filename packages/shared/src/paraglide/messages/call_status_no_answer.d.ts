/**
* | output |
* | --- |
* | "No answer" |
*
* @param {Call_Status_No_AnswerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_status_no_answer: ((inputs?: Call_Status_No_AnswerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Call_Status_No_AnswerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Call_Status_No_AnswerInputs = {};
