/**
* | output |
* | --- |
* | "Tickets that a volunteer has placed on hold. A ticket on hold is still open but temporarily set aside, usually because the volunteer is waiting for a respons..." |
*
* @param {Demo_Narrative_Dashboard_On_Hold_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_on_hold_body: ((inputs?: Demo_Narrative_Dashboard_On_Hold_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_On_Hold_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_On_Hold_BodyInputs = {};
