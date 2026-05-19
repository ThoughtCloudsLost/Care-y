/**
* | output |
* | --- |
* | "At least 20 characters" |
*
* @param {Onboarding_Escrow_Passphrase_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_passphrase_placeholder: ((inputs?: Onboarding_Escrow_Passphrase_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Passphrase_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Passphrase_PlaceholderInputs = {};
