/**
* | output |
* | --- |
* | "Verification code" |
*
* @param {Onboarding_Escrow_Hash_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_hash_label: ((inputs?: Onboarding_Escrow_Hash_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Hash_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Hash_LabelInputs = {};
