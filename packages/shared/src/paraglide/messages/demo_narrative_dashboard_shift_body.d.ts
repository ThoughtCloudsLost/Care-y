/**
* | output |
* | --- |
* | "The shift card shows the volunteer's current or upcoming shift. **During a shift,** the card displays start and end times and a countdown to the end of the s..." |
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
