/**
* | output |
* | --- |
* | "Any logged-in volunteer in your org" |
*
* @param {Onboarding_Briefing_Practice_Org_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_org_access: ((inputs?: Onboarding_Briefing_Practice_Org_AccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Practice_Org_AccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Practice_Org_AccessInputs = {};
