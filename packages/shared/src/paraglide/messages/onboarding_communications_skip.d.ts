/**
* | output |
* | --- |
* | "Skip for now" |
*
* @param {Onboarding_Communications_SkipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_communications_skip: ((inputs?: Onboarding_Communications_SkipInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Communications_SkipInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Communications_SkipInputs = {};
