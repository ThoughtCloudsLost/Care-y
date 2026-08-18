/**
* | output |
* | --- |
* | "Your encrypted information is kept as long as your case is open, plus any retention period set by the organization. See the telephony data disclosure below f..." |
*
* @param {Intake_Privacy_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_retention_body: ((inputs?: Intake_Privacy_Retention_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Retention_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Retention_BodyInputs = {};
