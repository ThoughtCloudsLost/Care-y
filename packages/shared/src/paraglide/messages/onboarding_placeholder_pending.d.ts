/**
* | output |
* | --- |
* | "This step will be available soon." |
*
* @param {Onboarding_Placeholder_PendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_placeholder_pending: ((inputs?: Onboarding_Placeholder_PendingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Placeholder_PendingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Placeholder_PendingInputs = {};
