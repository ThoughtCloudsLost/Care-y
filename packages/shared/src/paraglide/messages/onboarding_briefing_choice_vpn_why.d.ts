/**
* | output |
* | --- |
* | "Every time a volunteer opens CARE-Y, their internet provider logs a connection to your server. If someone obtains those logs, they learn that this person is ..." |
*
* @param {Onboarding_Briefing_Choice_Vpn_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_vpn_why: ((inputs?: Onboarding_Briefing_Choice_Vpn_WhyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Choice_Vpn_WhyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Choice_Vpn_WhyInputs = {};
