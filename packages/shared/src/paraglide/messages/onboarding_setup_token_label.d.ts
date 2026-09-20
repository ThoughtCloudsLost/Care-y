/**
* | output |
* | --- |
* | "Setup token" |
*
* @param {Onboarding_Setup_Token_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_token_label: ((inputs?: Onboarding_Setup_Token_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Setup_Token_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Setup_Token_LabelInputs = {};
