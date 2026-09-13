/**
* | output |
* | --- |
* | "Even if someone breaks into this server or seizes it, they cannot read what you wrote. Your information is locked and only unlocks for assigned volunteers." |
*
* @param {Intake_Protected_Encrypted_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_encrypted_why: ((inputs?: Intake_Protected_Encrypted_WhyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Protected_Encrypted_WhyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Protected_Encrypted_WhyInputs = {};
