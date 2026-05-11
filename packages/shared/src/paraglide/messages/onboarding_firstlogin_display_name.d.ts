/**
* | output |
* | --- |
* | "Display Name (optional)" |
*
* @param {Onboarding_Firstlogin_Display_NameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_display_name: ((inputs?: Onboarding_Firstlogin_Display_NameInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_Display_NameInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_Display_NameInputs = {};
