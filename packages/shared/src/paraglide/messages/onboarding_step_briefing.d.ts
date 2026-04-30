/**
* | output |
* | --- |
* | "Briefing" |
*
* @param {Onboarding_Step_BriefingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_briefing: ((inputs?: Onboarding_Step_BriefingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_BriefingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_BriefingInputs = {};
