/**
* | output |
* | --- |
* | "Notes are visible only to volunteers and are encrypted with the same per ticket key as messages. The server cannot distinguish a note from a client message b..." |
*
* @param {Demo_Narrative_Topic_Notes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_notes_body: ((inputs?: Demo_Narrative_Topic_Notes_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Notes_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Notes_BodyInputs = {};
