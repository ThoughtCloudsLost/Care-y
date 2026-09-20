/**
* | output |
* | --- |
* | "If you believe your data has been handled incorrectly, you have the right to lodge a complaint with a data protection supervisory authority in your country." |
*
* @param {Intake_Privacy_Complaint_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_complaint_body: ((inputs?: Intake_Privacy_Complaint_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Complaint_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Complaint_BodyInputs = {};
