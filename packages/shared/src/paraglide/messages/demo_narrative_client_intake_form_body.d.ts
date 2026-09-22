/**
* | output |
* | --- |
* | "The intake page takes a request for help from someone who has no account and no prior relationship to the organization, which is why it asks for nothing befo..." |
*
* @param {Demo_Narrative_Client_Intake_Form_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_form_body: ((inputs?: Demo_Narrative_Client_Intake_Form_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Intake_Form_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Intake_Form_BodyInputs = {};
