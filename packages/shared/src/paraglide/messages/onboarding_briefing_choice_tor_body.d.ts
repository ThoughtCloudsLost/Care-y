/**
* | output |
* | --- |
* | "Without Tor, your internet provider and anyone with access to their records can see that your volunteers and clients are using your service. With Tor enabled..." |
*
* @param {Onboarding_Briefing_Choice_Tor_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_tor_body: ((inputs?: Onboarding_Briefing_Choice_Tor_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Choice_Tor_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Choice_Tor_BodyInputs = {};
