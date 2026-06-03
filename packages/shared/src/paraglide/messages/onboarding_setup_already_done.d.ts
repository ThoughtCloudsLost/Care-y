/**
* | output |
* | --- |
* | "This organization has already been set up." |
*
* @param {Onboarding_Setup_Already_DoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_already_done: ((inputs?: Onboarding_Setup_Already_DoneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Setup_Already_DoneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Setup_Already_DoneInputs = {};
