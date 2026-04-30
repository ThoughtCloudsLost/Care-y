/**
* | output |
* | --- |
* | "A managed provider can hear your calls and keeps records. Self-hosted voice keeps call audio on your servers, but calls to regular phones still pass through ..." |
*
* @param {Onboarding_Briefing_Choice_Telephony_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_telephony_body: ((inputs?: Onboarding_Briefing_Choice_Telephony_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Choice_Telephony_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Choice_Telephony_BodyInputs = {};
