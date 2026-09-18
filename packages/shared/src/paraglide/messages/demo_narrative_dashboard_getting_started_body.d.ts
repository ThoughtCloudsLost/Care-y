/**
* | output |
* | --- |
* | "A card at the top of the overview lists setup tasks, each linking to the relevant admin page. **Visibility.** The checklist is visible only to administrators..." |
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
