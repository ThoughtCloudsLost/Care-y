/**
* | output |
* | --- |
* | "Your answer is encrypted. The service cannot read it." |
*
* @param {Intake_Privacy_EncryptedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_encrypted: ((inputs?: Intake_Privacy_EncryptedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_EncryptedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_EncryptedInputs = {};
