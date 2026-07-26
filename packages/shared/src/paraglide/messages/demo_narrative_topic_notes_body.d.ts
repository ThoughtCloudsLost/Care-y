/**
* | output |
* | --- |
* | "Notes are visible only to volunteers and are encrypted with the same per-ticket key. The server cannot distinguish a note from a message. Only your browser k..." |
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
