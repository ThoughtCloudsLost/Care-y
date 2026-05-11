/**
* | output |
* | --- |
* | "sha256:{hash}" |
*
* @param {Onboarding_Escrow_Hash_ValueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_hash_value: ((inputs: Onboarding_Escrow_Hash_ValueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Hash_ValueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Hash_ValueInputs = {
    hash: NonNullable<unknown>;
};
