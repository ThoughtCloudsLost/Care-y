/**
* | output |
* | --- |
* | "Voicemails from unknown callers land in the quarantine and wait for review. **Encryption.** Quarantine audio is sealed to the organization's public key befor..." |
*
* @param {Demo_Narrative_Admin_Quarantine_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_quarantine_body: ((inputs?: Demo_Narrative_Admin_Quarantine_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Quarantine_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Quarantine_BodyInputs = {};
