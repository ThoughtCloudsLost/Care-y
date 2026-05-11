/**
* | output |
* | --- |
* | "Passphrases do not match." |
*
* @param {Onboarding_Escrow_Error_Passphrase_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_error_passphrase_mismatch: ((inputs?: Onboarding_Escrow_Error_Passphrase_MismatchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Error_Passphrase_MismatchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Error_Passphrase_MismatchInputs = {};
