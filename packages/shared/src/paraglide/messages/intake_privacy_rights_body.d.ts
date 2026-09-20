/**
* | output |
* | --- |
* | "You can ask to see, correct, or delete your information. Contact the organization and provide your reference code (shown after you submit this form) so they ..." |
*
* @param {Intake_Privacy_Rights_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_rights_body: ((inputs?: Intake_Privacy_Rights_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Rights_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Rights_BodyInputs = {};
