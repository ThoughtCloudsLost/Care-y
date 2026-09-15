/**
* | output |
* | --- |
* | "The planned scope for shift scheduling is shifts that repeat on a schedule, assigning people to cover them, and a calendar showing where coverage is complete..." |
*
* @param {Demo_Narrative_Schedule_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_schedule_body: ((inputs?: Demo_Narrative_Schedule_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Schedule_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Schedule_BodyInputs = {};
