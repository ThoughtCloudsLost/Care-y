/**
* | output |
* | --- |
* | "When a volunteer sends a reply, the message is encrypted on the device with the per ticket key before it reaches the server. The server stores the ciphertext..." |
*
* @param {Demo_Narrative_Topic_Reply_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_reply_body: ((inputs?: Demo_Narrative_Topic_Reply_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Reply_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Reply_BodyInputs = {};
