/**
* | output |
* | --- |
* | "Only the specific volunteers assigned to that ticket" |
*
* @param {Onboarding_Briefing_Practice_Client_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_client_access: ((inputs?: Onboarding_Briefing_Practice_Client_AccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Practice_Client_AccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Practice_Client_AccessInputs = {};
