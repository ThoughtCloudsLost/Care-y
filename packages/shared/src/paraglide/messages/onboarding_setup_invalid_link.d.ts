/**
* | output |
* | --- |
* | "This setup link is invalid or has already been used. If you need a new setup link, contact the platform operator." |
*
* @param {Onboarding_Setup_Invalid_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_invalid_link: ((inputs?: Onboarding_Setup_Invalid_LinkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Setup_Invalid_LinkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Setup_Invalid_LinkInputs = {};
