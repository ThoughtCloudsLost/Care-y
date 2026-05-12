/**
* | output |
* | --- |
* | "Without Tor, your internet provider (and anyone who can access their records) can see that someone visited your CARE-Y site. Every connection includes an IP ..." |
*
* @param {Onboarding_Briefing_Choice_Tor_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_tor_why: ((inputs?: Onboarding_Briefing_Choice_Tor_WhyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Choice_Tor_WhyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Choice_Tor_WhyInputs = {};
