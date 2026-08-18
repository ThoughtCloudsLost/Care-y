/**
* | output |
* | --- |
* | "The plus button in the navigation bar opens a menu for creating new items. The options shown depend on the volunteer's role and permissions. **All volunteers..." |
*
* @param {Demo_Narrative_Dashboard_Create_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_create_body: ((inputs?: Demo_Narrative_Dashboard_Create_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Create_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Create_BodyInputs = {};
