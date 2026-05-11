/**
* | output |
* | --- |
* | "Passphrase must be at least 6 words or 20 characters." |
*
* @param {Onboarding_Escrow_Error_Passphrase_ShortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_error_passphrase_short: ((inputs?: Onboarding_Escrow_Error_Passphrase_ShortInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Error_Passphrase_ShortInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Error_Passphrase_ShortInputs = {};
