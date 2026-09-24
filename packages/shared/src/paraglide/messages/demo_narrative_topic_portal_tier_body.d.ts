/**
* | output |
* | --- |
* | "The tier section reports how the client currently receives messages and offers the controls that change it: setting up a secure link, regenerating or revokin..." |
*
* @param {Demo_Narrative_Topic_Portal_Tier_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_portal_tier_body: ((inputs?: Demo_Narrative_Topic_Portal_Tier_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Portal_Tier_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Portal_Tier_BodyInputs = {};
