/**
* | output |
* | --- |
* | "A volunteer's device is compromised" |
*
* @param {Onboarding_Briefing_Scenario_Device_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_device_title: ((inputs?: Onboarding_Briefing_Scenario_Device_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Scenario_Device_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Scenario_Device_TitleInputs = {};
