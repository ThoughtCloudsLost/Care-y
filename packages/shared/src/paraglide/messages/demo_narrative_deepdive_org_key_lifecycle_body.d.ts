/**
* | output |
* | --- |
* | "The organization key protects shared material that every signed-in user can read, and it also seals people-identifying fields such as display names and login..." |
*
* @param {Demo_Narrative_Deepdive_Org_Key_Lifecycle_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_org_key_lifecycle_body: ((inputs?: Demo_Narrative_Deepdive_Org_Key_Lifecycle_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Deepdive_Org_Key_Lifecycle_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Deepdive_Org_Key_Lifecycle_BodyInputs = {};
