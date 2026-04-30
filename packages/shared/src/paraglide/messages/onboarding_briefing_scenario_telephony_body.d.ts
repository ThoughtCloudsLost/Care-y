/**
* | output |
* | --- |
* | "The phone provider can hear calls and read SMS messages. They keep records of who your org called, when, and for how long. Sensitive conversations should hap..." |
*
* @param {Onboarding_Briefing_Scenario_Telephony_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_telephony_body: ((inputs?: Onboarding_Briefing_Scenario_Telephony_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Scenario_Telephony_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Scenario_Telephony_BodyInputs = {};
