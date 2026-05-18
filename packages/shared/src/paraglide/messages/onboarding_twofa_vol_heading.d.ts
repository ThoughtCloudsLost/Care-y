/**
* | output |
* | --- |
* | "Protect Your Account" |
*
* @param {Onboarding_Twofa_Vol_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_vol_heading: ((inputs?: Onboarding_Twofa_Vol_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_Vol_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_Vol_HeadingInputs = {};
