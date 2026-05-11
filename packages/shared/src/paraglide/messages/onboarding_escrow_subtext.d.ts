/**
* | output |
* | --- |
* | "If you lose access to your admin account, this file is the only way to recover your organization's data." |
*
* @param {Onboarding_Escrow_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_subtext: ((inputs?: Onboarding_Escrow_SubtextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_SubtextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_SubtextInputs = {};
