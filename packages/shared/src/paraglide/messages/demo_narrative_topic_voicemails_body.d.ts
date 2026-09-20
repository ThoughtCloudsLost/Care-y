/**
* | output |
* | --- |
* | "When a client leaves a voicemail on the phone line, the recording is stored encrypted and the browser decrypts and decodes the audio locally, so the server o..." |
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
