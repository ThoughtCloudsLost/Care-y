/**
* | output |
* | --- |
* | "Phone numbers can be blocked from reaching the organization. Blocked numbers are rejected before a ticket is created." |
*
* @param {Demo_Narrative_Admin_Blocklist_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_blocklist_body: ((inputs?: Demo_Narrative_Admin_Blocklist_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Blocklist_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Blocklist_BodyInputs = {};
