/**
* | output |
* | --- |
* | "After login, volunteers land on the dashboard. It shows recent ticket activity, open counts per queue, and a shift summary. Activity and counts come from the..." |
*
* @param {Demo_Narrative_Dashboard_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_body: ((inputs?: Demo_Narrative_Dashboard_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_BodyInputs = {};
