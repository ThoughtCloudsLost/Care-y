/**
* | output |
* | --- |
* | "Setup Complete" |
*
* @param {Onboarding_Wizard_Complete_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_wizard_complete_heading: ((inputs?: Onboarding_Wizard_Complete_HeadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Wizard_Complete_HeadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Wizard_Complete_HeadingInputs = {};
