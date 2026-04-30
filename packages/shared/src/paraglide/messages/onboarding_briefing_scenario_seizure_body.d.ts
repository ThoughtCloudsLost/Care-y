/**
* | output |
* | --- |
* | "An attacker with full access to the server's database gets encrypted data they cannot read. Client tickets, messages, case notes, and volunteer details remai..." |
*
* @param {Onboarding_Briefing_Scenario_Seizure_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_seizure_body: ((inputs?: Onboarding_Briefing_Scenario_Seizure_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Scenario_Seizure_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Scenario_Seizure_BodyInputs = {};
