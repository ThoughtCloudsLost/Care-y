/**
* | output |
* | --- |
* | "The decisions you make during setup affect the security of every volunteer and client in your org." |
*
* @param {Onboarding_Briefing_Choices_IntroInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choices_intro: ((inputs?: Onboarding_Briefing_Choices_IntroInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Choices_IntroInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Choices_IntroInputs = {};
