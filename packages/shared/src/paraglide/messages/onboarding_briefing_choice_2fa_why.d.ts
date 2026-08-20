/**
* | output |
* | --- |
* | "A password alone can be guessed, leaked, or stolen through a fake login page. Two factor authentication adds a second check that makes stolen passwords usele..." |
*
* @param {Onboarding_Briefing_Choice_2fa_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_2fa_why: ((inputs?: Onboarding_Briefing_Choice_2fa_WhyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Choice_2fa_WhyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Choice_2fa_WhyInputs = {};
