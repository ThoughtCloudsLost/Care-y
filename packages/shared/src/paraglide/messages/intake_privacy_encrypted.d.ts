/**
* | output |
* | --- |
* | "Your answer is encrypted. The service cannot read it." |
*
* @param {Intake_Privacy_EncryptedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_encrypted: ((inputs?: Intake_Privacy_EncryptedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_EncryptedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_EncryptedInputs = {};
