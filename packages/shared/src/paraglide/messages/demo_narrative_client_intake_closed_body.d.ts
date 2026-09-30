/**
* | output |
* | --- |
* | "A form whose closing date has passed replaces its fields with the organization's closing message. When no closing message has been written, a built-in notice..." |
*
* @param {Demo_Narrative_Client_Intake_Closed_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_closed_body: ((inputs?: Demo_Narrative_Client_Intake_Closed_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Intake_Closed_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Intake_Closed_BodyInputs = {};
