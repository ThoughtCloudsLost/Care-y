/**
* | output |
* | --- |
* | "Recorded and text greetings are what callers hear when they reach a phone line. The demo seeds both greeting types and plays a real audio file through an aut..." |
*
* @param {Demo_Narrative_Topic_Admin_Greetings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_admin_greetings_body: ((inputs?: Demo_Narrative_Topic_Admin_Greetings_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Admin_Greetings_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Admin_Greetings_BodyInputs = {};
