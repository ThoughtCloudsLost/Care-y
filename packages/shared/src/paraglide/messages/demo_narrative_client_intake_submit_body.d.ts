/**
* | output |
* | --- |
* | "Submitting encrypts every answer in the browser, composes the case title and body from them there as well, and sends ciphertext the server has no key for. Th..." |
*
* @param {Demo_Narrative_Client_Intake_Submit_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_submit_body: ((inputs?: Demo_Narrative_Client_Intake_Submit_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Intake_Submit_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Intake_Submit_BodyInputs = {};
