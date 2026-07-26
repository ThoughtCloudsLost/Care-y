/**
* | output |
* | --- |
* | "When you open the app, your browser decrypts each ticket on the fly. If your session ends, the keys are wiped from memory and the data returns to scrambled c..." |
*
* @param {Demo_Narrative_Tickets_Body2Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_tickets_body2: ((inputs?: Demo_Narrative_Tickets_Body2Inputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Tickets_Body2Inputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Tickets_Body2Inputs = {};
