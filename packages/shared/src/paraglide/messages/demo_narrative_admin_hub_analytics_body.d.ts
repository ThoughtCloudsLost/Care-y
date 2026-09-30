/**
* | output |
* | --- |
* | "The analytics group collects the reporting and logging destinations under separate permission gates. [[#permissions #metadata]] - The Impact, Operations, and..." |
*
* @param {Demo_Narrative_Admin_Hub_Analytics_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_analytics_body: ((inputs?: Demo_Narrative_Admin_Hub_Analytics_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Hub_Analytics_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Hub_Analytics_BodyInputs = {};
