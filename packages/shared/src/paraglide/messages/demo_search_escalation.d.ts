/**
* | output |
* | --- |
* | "Unlocking remaining tickets" |
*
* @param {Demo_Search_EscalationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_search_escalation: ((inputs?: Demo_Search_EscalationInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Search_EscalationInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Search_EscalationInputs = {};
