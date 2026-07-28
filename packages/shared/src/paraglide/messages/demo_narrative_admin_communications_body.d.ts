/**
* | output |
* | --- |
* | "The communications page manages phone lines, greetings, SMS templates, a blocklist, and a voicemail quarantine. Two fictional 555 numbers are seeded with pur..." |
*
* @param {Demo_Narrative_Admin_Communications_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_communications_body: ((inputs?: Demo_Narrative_Admin_Communications_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Communications_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Communications_BodyInputs = {};
