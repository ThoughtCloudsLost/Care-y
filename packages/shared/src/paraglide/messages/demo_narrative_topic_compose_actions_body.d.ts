/**
* | output |
* | --- |
* | "The compose bar offers quick actions: attach files, switch to SMS, toggle internal note mode. Attachments are encrypted before upload. The server stores bina..." |
*
* @param {Demo_Narrative_Topic_Compose_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_compose_actions_body: ((inputs?: Demo_Narrative_Topic_Compose_Actions_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Compose_Actions_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Compose_Actions_BodyInputs = {};
