/**
* | output |
* | --- |
* | "Administrators see a setup checklist at the top of the dashboard until the organization is fully configured. Each row is a setup task that links directly to ..." |
*
* @param {Demo_Narrative_Dashboard_Getting_Started_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_getting_started_body: ((inputs?: Demo_Narrative_Dashboard_Getting_Started_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Getting_Started_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Getting_Started_BodyInputs = {};
