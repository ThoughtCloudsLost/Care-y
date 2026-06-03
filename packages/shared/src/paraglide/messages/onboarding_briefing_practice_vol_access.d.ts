/**
* | output |
* | --- |
* | "Only logged-in volunteers in your org (encrypted)" |
*
* @param {Onboarding_Briefing_Practice_Vol_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_vol_access: ((inputs?: Onboarding_Briefing_Practice_Vol_AccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Practice_Vol_AccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Practice_Vol_AccessInputs = {};
