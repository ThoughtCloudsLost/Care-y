/**
* | output |
* | --- |
* | "Your reply is encrypted on device before it reaches the server. The server relays ciphertext to the intended recipient. If the channel is SMS, the relay forw..." |
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
