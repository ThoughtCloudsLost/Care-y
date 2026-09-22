/**
* | output |
* | --- |
* | "The privacy notice sets out who collects a submission, what is collected, who can open it, how long it is kept and what the visitor can ask for afterward, ac..." |
*
* @param {Demo_Narrative_Client_Privacy_Notice_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_privacy_notice_body: ((inputs?: Demo_Narrative_Client_Privacy_Notice_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Privacy_Notice_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Privacy_Notice_BodyInputs = {};
