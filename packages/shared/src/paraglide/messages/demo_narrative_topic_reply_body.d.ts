/**
* | output |
* | --- |
* | "When a volunteer sends a reply, the message is encrypted on the device with the per ticket key before it reaches the server. The server stores the ciphertext..." |
*
* @param {Demo_Narrative_Topic_Reply_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_reply_body: ((inputs?: Demo_Narrative_Topic_Reply_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Reply_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Reply_BodyInputs = {};
