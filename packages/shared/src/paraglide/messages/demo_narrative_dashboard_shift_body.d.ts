/**
* | output |
* | --- |
* | "The shift card shows the current or upcoming shift for the signed-in volunteer. **During a shift.** The card displays start and end times, a countdown, and t..." |
*
* @param {Demo_Narrative_Dashboard_Shift_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_shift_body: ((inputs?: Demo_Narrative_Dashboard_Shift_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Shift_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Shift_BodyInputs = {};
