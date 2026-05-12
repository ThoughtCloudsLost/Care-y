/**
* | output |
* | --- |
* | "Used to sign in. Do not use your real name or email. Lowercase letters, digits, dots, hyphens, or underscores." |
*
* @param {Onboarding_Account_Username_InfoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_username_info: ((inputs?: Onboarding_Account_Username_InfoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_Username_InfoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_Username_InfoInputs = {};
