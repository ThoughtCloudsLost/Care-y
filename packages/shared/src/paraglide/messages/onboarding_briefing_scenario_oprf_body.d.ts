/**
* | output |
* | --- |
* | "An attacker gets one half of the verification process, which is useless on its own. The other half is on a server in a different country under different lega..." |
*
* @param {Onboarding_Briefing_Scenario_Oprf_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_oprf_body: ((inputs?: Onboarding_Briefing_Scenario_Oprf_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Scenario_Oprf_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Scenario_Oprf_BodyInputs = {};
