/**
* | output |
* | --- |
* | "Before accessing the Overview, set up a second verification method. This protects both you and the people you serve." |
*
* @param {Onboarding_Twofa_Vol_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_vol_desc: ((inputs?: Onboarding_Twofa_Vol_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_Vol_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_Vol_DescInputs = {};
