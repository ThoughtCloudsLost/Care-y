/**
* | output |
* | --- |
* | "Configure phone service, greetings, SMS templates, and blocked numbers. You can skip this and set it up later from admin settings." |
*
* @param {Onboarding_Communications_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_communications_subtext: ((inputs?: Onboarding_Communications_SubtextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Communications_SubtextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Communications_SubtextInputs = {};
