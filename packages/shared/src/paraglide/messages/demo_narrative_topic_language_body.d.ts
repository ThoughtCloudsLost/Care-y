/**
* | output |
* | --- |
* | "Volunteers can switch the interface language at the login screen or at any point after signing in. The switch happens instantly without a page reload because..." |
*
* @param {Demo_Narrative_Topic_Language_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_language_body: ((inputs?: Demo_Narrative_Topic_Language_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Language_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Language_BodyInputs = {};
