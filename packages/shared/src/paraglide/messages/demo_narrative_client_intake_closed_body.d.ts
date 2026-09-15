/**
* | output |
* | --- |
* | "The closed form state replaces the form fields with the organization's configured closing message and prevents submission. **Custom message.** Administrators..." |
*
* @param {Demo_Narrative_Client_Intake_Closed_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_closed_body: ((inputs?: Demo_Narrative_Client_Intake_Closed_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Intake_Closed_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Intake_Closed_BodyInputs = {};
