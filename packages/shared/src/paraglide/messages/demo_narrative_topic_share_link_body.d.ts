/**
* | output |
* | --- |
* | "A share link carries one message to someone outside the system, over an address that stops working after the first read or after 72 hours, whichever comes fi..." |
*
* @param {Demo_Narrative_Topic_Share_Link_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_share_link_body: ((inputs?: Demo_Narrative_Topic_Share_Link_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Share_Link_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Share_Link_BodyInputs = {};
