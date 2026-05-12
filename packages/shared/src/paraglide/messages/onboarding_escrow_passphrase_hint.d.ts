/**
* | output |
* | --- |
* | "Use at least 6 words or 20 characters. A random phrase like \"correct horse battery staple river lamp\" is strong and easy to remember." |
*
* @param {Onboarding_Escrow_Passphrase_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_passphrase_hint: ((inputs?: Onboarding_Escrow_Passphrase_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Passphrase_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Passphrase_HintInputs = {};
