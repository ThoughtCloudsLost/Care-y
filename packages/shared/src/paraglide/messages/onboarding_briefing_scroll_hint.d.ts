/**
* | output |
* | --- |
* | "Scroll to the bottom to continue" |
*
* @param {Onboarding_Briefing_Scroll_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scroll_hint: ((inputs?: Onboarding_Briefing_Scroll_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Scroll_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Scroll_HintInputs = {};
