/**
* | output |
* | --- |
* | "The hub organizes destinations into four groups. People, Communications, Organization, and Analytics each show a live count from the database and link to the..." |
*
* @param {Demo_Narrative_Admin_Hub_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_body: ((inputs?: Demo_Narrative_Admin_Hub_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Hub_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Hub_BodyInputs = {};
