/**
* | output |
* | --- |
* | "Go to Overview" |
*
* @param {Onboarding_Wizard_Complete_GoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_wizard_complete_go: ((inputs?: Onboarding_Wizard_Complete_GoInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Wizard_Complete_GoInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Wizard_Complete_GoInputs = {};
