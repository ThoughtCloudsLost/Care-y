/**
* | output |
* | --- |
* | "Privacy notice" |
*
* @param {Intake_Footer_PrivacyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_footer_privacy: ((inputs?: Intake_Footer_PrivacyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Footer_PrivacyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Footer_PrivacyInputs = {};
