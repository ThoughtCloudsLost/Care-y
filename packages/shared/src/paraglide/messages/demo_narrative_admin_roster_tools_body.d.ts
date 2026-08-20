/**
* | output |
* | --- |
* | "The users tab has the same working tools as the ticket list. **Filters.** Pills narrow the roster by role, status, key state, and queue membership. **Sort.**..." |
*
* @param {Demo_Narrative_Admin_Roster_Tools_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_roster_tools_body: ((inputs?: Demo_Narrative_Admin_Roster_Tools_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Roster_Tools_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Roster_Tools_BodyInputs = {};
