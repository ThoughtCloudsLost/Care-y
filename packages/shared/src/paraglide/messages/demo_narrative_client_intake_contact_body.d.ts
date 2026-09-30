/**
* | output |
* | --- |
* | "The default form accepts a phone number, an email address, or a refusal as the visitor's contact preference. The answer is encrypted alongside the submission..." |
*
* @param {Demo_Narrative_Client_Intake_Contact_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_contact_body: ((inputs?: Demo_Narrative_Client_Intake_Contact_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Intake_Contact_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Intake_Contact_BodyInputs = {};
