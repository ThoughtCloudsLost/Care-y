/**
* | output |
* | --- |
* | "Set Up Your Account" |
*
* @param {Onboarding_Firstlogin_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_heading: ((inputs?: Onboarding_Firstlogin_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_HeadingInputs = {};
