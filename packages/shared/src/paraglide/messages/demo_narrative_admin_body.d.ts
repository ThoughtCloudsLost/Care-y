/**
* | output |
* | --- |
* | "The admin hub shows how many volunteers, queues, phone lines, greetings, and SMS templates the organization has. Administrators can navigate to volunteer man..." |
*
* @param {Demo_Narrative_Admin_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_body: ((inputs?: Demo_Narrative_Admin_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_BodyInputs = {};
