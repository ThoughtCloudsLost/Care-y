/**
* | output |
* | --- |
* | "Generating escrow file..." |
*
* @param {Onboarding_Escrow_GeneratingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_generating: ((inputs?: Onboarding_Escrow_GeneratingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_GeneratingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_GeneratingInputs = {};
