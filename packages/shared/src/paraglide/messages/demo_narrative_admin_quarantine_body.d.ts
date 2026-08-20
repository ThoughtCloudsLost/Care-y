/**
* | output |
* | --- |
* | "Voicemails from unknown callers wait here for review. The audio is sealed to the organization's public key before storage using crypto_box_seal, so the serve..." |
*
* @param {Demo_Narrative_Admin_Quarantine_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_quarantine_body: ((inputs?: Demo_Narrative_Admin_Quarantine_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Quarantine_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Quarantine_BodyInputs = {};
