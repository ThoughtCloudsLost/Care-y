/**
* | output |
* | --- |
* | "If you use the phone service, your phone number is processed by Twilio, which operates in the United States. This transfer is covered by Standard Contractual..." |
*
* @param {Intake_Privacy_Transfer_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_transfer_body: ((inputs?: Intake_Privacy_Transfer_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Transfer_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Transfer_BodyInputs = {};
