/**
* | output |
* | --- |
* | "Volunteers assigned to your case can read your information after decrypting it on their own devices. If you call or text the hotline, your phone number passe..." |
*
* @param {Intake_Privacy_Sharing_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_sharing_body: ((inputs?: Intake_Privacy_Sharing_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Sharing_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Sharing_BodyInputs = {};
