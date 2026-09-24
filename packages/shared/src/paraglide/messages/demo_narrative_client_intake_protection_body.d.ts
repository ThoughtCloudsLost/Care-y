/**
* | output |
* | --- |
* | "The intake form encrypts every value the visitor types before it leaves the browser, the server cannot read the answers at any point, and nobody outside the ..." |
*
* @param {Demo_Narrative_Client_Intake_Protection_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_protection_body: ((inputs?: Demo_Narrative_Client_Intake_Protection_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Intake_Protection_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Intake_Protection_BodyInputs = {};
