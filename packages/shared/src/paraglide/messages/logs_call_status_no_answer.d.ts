/**
* | output |
* | --- |
* | "No answer" |
*
* @param {Logs_Call_Status_No_AnswerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_no_answer: ((inputs?: Logs_Call_Status_No_AnswerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Call_Status_No_AnswerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Call_Status_No_AnswerInputs = {};
