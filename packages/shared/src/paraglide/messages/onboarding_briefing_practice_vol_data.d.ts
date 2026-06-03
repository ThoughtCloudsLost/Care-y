/**
* | output |
* | --- |
* | "Volunteer display names, IP addresses, session details" |
*
* @param {Onboarding_Briefing_Practice_Vol_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_vol_data: ((inputs?: Onboarding_Briefing_Practice_Vol_DataInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Practice_Vol_DataInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Practice_Vol_DataInputs = {};
