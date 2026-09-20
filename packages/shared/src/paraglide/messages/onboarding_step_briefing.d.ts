/**
* | output |
* | --- |
* | "Briefing" |
*
* @param {Onboarding_Step_BriefingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_briefing: ((inputs?: Onboarding_Step_BriefingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_BriefingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_BriefingInputs = {};
