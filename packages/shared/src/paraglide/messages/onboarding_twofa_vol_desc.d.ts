/**
* | output |
* | --- |
* | "Before accessing the dashboard, set up a second verification method. This protects both you and the people you serve." |
*
* @param {Onboarding_Twofa_Vol_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_vol_desc: ((inputs?: Onboarding_Twofa_Vol_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_Vol_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_Vol_DescInputs = {};
