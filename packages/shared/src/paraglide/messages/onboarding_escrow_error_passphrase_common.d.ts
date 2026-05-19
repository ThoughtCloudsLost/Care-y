/**
* | output |
* | --- |
* | "This passphrase follows a predictable pattern. Use a more varied phrase." |
*
* @param {Onboarding_Escrow_Error_Passphrase_CommonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_error_passphrase_common: ((inputs?: Onboarding_Escrow_Error_Passphrase_CommonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Error_Passphrase_CommonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Error_Passphrase_CommonInputs = {};
