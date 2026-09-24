/**
* | output |
* | --- |
* | "Your organization is ready. Here are some things you may want to configure next." |
*
* @param {Onboarding_Wizard_Complete_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_wizard_complete_body: ((inputs?: Onboarding_Wizard_Complete_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Wizard_Complete_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Wizard_Complete_BodyInputs = {};
