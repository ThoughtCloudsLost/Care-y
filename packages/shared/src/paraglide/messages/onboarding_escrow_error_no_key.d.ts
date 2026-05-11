/**
* | output |
* | --- |
* | "Org encryption key is not loaded. Please restart the setup." |
*
* @param {Onboarding_Escrow_Error_No_KeyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_error_no_key: ((inputs?: Onboarding_Escrow_Error_No_KeyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Error_No_KeyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Error_No_KeyInputs = {};
