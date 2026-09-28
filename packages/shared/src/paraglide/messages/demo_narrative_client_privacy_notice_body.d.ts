/**
* | output |
* | --- |
* | "The privacy notice is a fixed page linked from the drawer on every client page. It states who collects a submission, what data is gathered, who can read it, ..." |
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
