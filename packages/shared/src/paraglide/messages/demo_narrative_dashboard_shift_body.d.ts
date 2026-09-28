/**
* | output |
* | --- |
* | "The shift summary shows the active shift window, time remaining, and how many open tickets are assigned to the user. [[#schedule #privacy]] **Open-ticket cou..." |
*
* @param {Demo_Narrative_Dashboard_Shift_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_shift_body: ((inputs?: Demo_Narrative_Dashboard_Shift_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Shift_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Shift_BodyInputs = {};
