/**
* | output |
* | --- |
* | "No answer" |
*
* @param {Logs_Call_Status_No_AnswerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_no_answer: ((inputs?: Logs_Call_Status_No_AnswerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Call_Status_No_AnswerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Call_Status_No_AnswerInputs = {};
