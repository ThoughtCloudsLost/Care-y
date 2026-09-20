/**
* | output |
* | --- |
* | "Phone numbers can be blocked from reaching the organization, and a blocked number is rejected before a ticket is created. **Encryption.** Blocked numbers are..." |
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
