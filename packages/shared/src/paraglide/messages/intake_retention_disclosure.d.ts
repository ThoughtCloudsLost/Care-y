/**
* | output |
* | --- |
* | "When you call or text this hotline, your phone number is used to connect the call or deliver the message. The hotline system encrypts your information immedi..." |
*
* @param {Intake_Retention_DisclosureInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_retention_disclosure: ((inputs?: Intake_Retention_DisclosureInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Retention_DisclosureInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Retention_DisclosureInputs = {};
