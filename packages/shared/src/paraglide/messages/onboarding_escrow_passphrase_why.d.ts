/**
* | output |
* | --- |
* | "Choose a passphrase to encrypt the backup file. You will need this passphrase to unlock the file during recovery. It is never stored anywhere, so if you forg..." |
*
* @param {Onboarding_Escrow_Passphrase_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_passphrase_why: ((inputs?: Onboarding_Escrow_Passphrase_WhyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Passphrase_WhyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Passphrase_WhyInputs = {};
