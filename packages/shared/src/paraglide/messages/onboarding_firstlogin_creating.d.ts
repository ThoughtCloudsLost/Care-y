/**
* | output |
* | --- |
* | "Creating account..." |
*
* @param {Onboarding_Firstlogin_CreatingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_creating: ((inputs?: Onboarding_Firstlogin_CreatingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_CreatingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_CreatingInputs = {};
