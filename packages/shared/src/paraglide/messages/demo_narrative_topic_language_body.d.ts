/**
* | output |
* | --- |
* | "The user can switch the interface language before signing in or at any time afterward. English and Spanish are compiled into the app, and a switch takes effe..." |
*
* @param {Demo_Narrative_Topic_Language_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_language_body: ((inputs?: Demo_Narrative_Topic_Language_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Language_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Language_BodyInputs = {};
