/**
* | output |
* | --- |
* | "An administrator set the temporary password you signed in with. The keys that protect your account are derived from your password, so choose your own now." |
*
* @param {Onboarding_Password_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_password_desc: ((inputs?: Onboarding_Password_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Password_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Password_DescInputs = {};
