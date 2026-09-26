/**
* | output |
* | --- |
* | "The blocklist prevents a phone number from reaching the organization. An inbound call from a blocked number receives a busy signal, and an inbound text is dr..." |
*
* @param {Demo_Narrative_Admin_Blocklist_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_blocklist_body: ((inputs?: Demo_Narrative_Admin_Blocklist_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Blocklist_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Blocklist_BodyInputs = {};
