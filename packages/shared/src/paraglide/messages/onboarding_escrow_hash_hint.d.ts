/**
* | output |
* | --- |
* | "This code is unique to the file you just downloaded. Write it down and store it separately from the backup file. To check the file has not been corrupted or ..." |
*
* @param {Onboarding_Escrow_Hash_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_hash_hint: ((inputs?: Onboarding_Escrow_Hash_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Hash_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Hash_HintInputs = {};
