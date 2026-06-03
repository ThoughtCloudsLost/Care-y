/**
* | output |
* | --- |
* | "While that volunteer is logged in, the attacker can see everything the volunteer can see. This is the one scenario CARE-Y cannot fully prevent. You can limit..." |
*
* @param {Onboarding_Briefing_Scenario_Device_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_device_body: ((inputs?: Onboarding_Briefing_Scenario_Device_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Scenario_Device_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Scenario_Device_BodyInputs = {};
