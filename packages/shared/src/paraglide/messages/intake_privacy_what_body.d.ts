/**
* | output |
* | --- |
* | "We collect the information you provide on this form (your name if given, contact details, and your message) to connect you with a volunteer who can help. All..." |
*
* @param {Intake_Privacy_What_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_what_body: ((inputs?: Intake_Privacy_What_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_What_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_What_BodyInputs = {};
