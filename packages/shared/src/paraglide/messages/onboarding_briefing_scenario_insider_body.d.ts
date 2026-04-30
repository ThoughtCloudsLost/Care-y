/**
* | output |
* | --- |
* | "A volunteer can read any ticket they are assigned to. Once they have seen decrypted data, no technical control can undo that. Limit damage by assigning the m..." |
*
* @param {Onboarding_Briefing_Scenario_Insider_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_insider_body: ((inputs?: Onboarding_Briefing_Scenario_Insider_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Scenario_Insider_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Scenario_Insider_BodyInputs = {};
