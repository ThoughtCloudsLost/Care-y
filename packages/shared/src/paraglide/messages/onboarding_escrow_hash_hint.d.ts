/**
* | output |
* | --- |
* | "Write this down and keep it separate from the backup file. To verify the file later, run \"shasum -a 256 filename.json\" on Mac/Linux or \"certutil -hashfile fi..." |
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
