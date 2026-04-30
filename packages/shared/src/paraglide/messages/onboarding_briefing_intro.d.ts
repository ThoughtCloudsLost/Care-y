/**
* | output |
* | --- |
* | "CARE-Y encrypts everything in the volunteer's browser before it reaches the server. The server stores only scrambled data it cannot read. Decryption requires..." |
*
* @param {Onboarding_Briefing_IntroInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_intro: ((inputs?: Onboarding_Briefing_IntroInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_IntroInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_IntroInputs = {};
