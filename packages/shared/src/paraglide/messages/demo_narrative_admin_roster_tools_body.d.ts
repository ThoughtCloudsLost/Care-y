/**
* | output |
* | --- |
* | "Four filters, three sort fields and a search narrow the roster after the browser has fetched it, so none of them tell the server what was looked for. [[#priv..." |
*
* @param {Demo_Narrative_Admin_Roster_Tools_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_roster_tools_body: ((inputs?: Demo_Narrative_Admin_Roster_Tools_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Roster_Tools_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Roster_Tools_BodyInputs = {};
