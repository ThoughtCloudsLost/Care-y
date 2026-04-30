/**
* | output |
* | --- |
* | "Someone monitoring internet traffic can see that a person is connecting to your server and determine their location by IP address. They cannot read what is b..." |
*
* @param {Onboarding_Briefing_Scenario_Network_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_network_body: ((inputs?: Onboarding_Briefing_Scenario_Network_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Scenario_Network_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Scenario_Network_BodyInputs = {};
