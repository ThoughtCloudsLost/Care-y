/**
* | output |
* | --- |
* | "Other people who use this system cannot see it. The server itself cannot see it. Access is limited to the specific people helping you." |
*
* @param {Intake_Protected_Volunteers_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_volunteers_why: ((inputs?: Intake_Protected_Volunteers_WhyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Protected_Volunteers_WhyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Protected_Volunteers_WhyInputs = {};
