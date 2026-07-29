/**
* | output |
* | --- |
* | "Voicemails from unknown callers wait here for review. The audio is sealed to the organization key before storage, so the server never hears the recording. Pl..." |
*
* @param {Demo_Narrative_Topic_Admin_Quarantine_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_admin_quarantine_body: ((inputs?: Demo_Narrative_Topic_Admin_Quarantine_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Admin_Quarantine_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Admin_Quarantine_BodyInputs = {};
