/**
* | output |
* | --- |
* | "Volunteers can close a ticket when the case is resolved. **Resolution notes.** When closing, the system checks which note types are marked as required on clo..." |
*
* @param {Demo_Narrative_Topic_Close_Reopen_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_close_reopen_body: ((inputs?: Demo_Narrative_Topic_Close_Reopen_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Close_Reopen_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Close_Reopen_BodyInputs = {};
