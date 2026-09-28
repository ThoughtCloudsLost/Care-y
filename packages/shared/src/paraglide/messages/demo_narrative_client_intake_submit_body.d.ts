/**
* | output |
* | --- |
* | "The browser encrypts every answer, composes the ticket title and body from them, and sends only ciphertext to the server. The server creates the ticket, assi..." |
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
