/**
* | output |
* | --- |
* | "Volunteers decrypt your information on their own devices. Until someone first opens your case it can be unlocked with the organization's key; after that, onl..." |
*
* @param {Intake_Privacy_Sharing_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_sharing_body: ((inputs?: Intake_Privacy_Sharing_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Sharing_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Sharing_BodyInputs = {};
