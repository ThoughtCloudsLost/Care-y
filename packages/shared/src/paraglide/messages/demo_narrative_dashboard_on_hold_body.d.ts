/**
* | output |
* | --- |
* | "This section lists every on-hold ticket from the queues the signed-in user belongs to, regardless of who placed the hold. In the stacked layout the section d..." |
*
* @param {Demo_Narrative_Dashboard_On_Hold_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_on_hold_body: ((inputs?: Demo_Narrative_Dashboard_On_Hold_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_On_Hold_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_On_Hold_BodyInputs = {};
