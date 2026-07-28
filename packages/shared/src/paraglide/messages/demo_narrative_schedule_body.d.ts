/**
* | output |
* | --- |
* | "This page will let managers create and assign shifts. The scheduling feature is still in development. For now, the page shows a placeholder notice." |
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
