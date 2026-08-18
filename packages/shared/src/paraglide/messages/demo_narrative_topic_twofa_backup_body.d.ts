/**
* | output |
* | --- |
* | "A set of one time codes generated during enrollment and stored by the volunteer outside the system. Each code works exactly once. **When to use them.** Backu..." |
*
* @param {Demo_Narrative_Topic_Twofa_Backup_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_backup_body: ((inputs?: Demo_Narrative_Topic_Twofa_Backup_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Twofa_Backup_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Twofa_Backup_BodyInputs = {};
