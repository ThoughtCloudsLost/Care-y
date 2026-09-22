/**
* | output |
* | --- |
* | "Setting up a secure link mints a private page for one client, reachable only by the exact address the user hands over. [[#portal #keys]] **What the browser m..." |
*
* @param {Demo_Narrative_Topic_Secure_Link_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_secure_link_body: ((inputs?: Demo_Narrative_Topic_Secure_Link_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Secure_Link_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Secure_Link_BodyInputs = {};
