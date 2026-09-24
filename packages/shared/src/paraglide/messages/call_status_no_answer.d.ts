/**
* | output |
* | --- |
* | "No answer" |
*
* @param {Call_Status_No_AnswerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const call_status_no_answer: ((inputs?: Call_Status_No_AnswerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Call_Status_No_AnswerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Call_Status_No_AnswerInputs = {};
