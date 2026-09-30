/**
* | output |
* | --- |
* | "A voicemail left on the organization's line becomes a follow-up on the client's ticket, with audio the browser can play and the server cannot read. [[#teleph..." |
*
* @param {Demo_Narrative_Topic_Voicemails_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_voicemails_body: ((inputs?: Demo_Narrative_Topic_Voicemails_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Voicemails_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Voicemails_BodyInputs = {};
