/**
* | output |
* | --- |
* | "Your information is encrypted before it leaves your device. The people who run the servers can never read it, and nobody outside the organization can see it...." |
*
* @param {Intake_Protected_Volunteers_WhyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_protected_volunteers_why: ((inputs?: Intake_Protected_Volunteers_WhyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Protected_Volunteers_WhyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Protected_Volunteers_WhyInputs = {};
