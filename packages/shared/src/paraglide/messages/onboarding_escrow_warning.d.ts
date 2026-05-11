/**
* | output |
* | --- |
* | "Store this file on an encrypted USB drive in a physically secure location. For production deployments, follow the full escrow ceremony in the operations manual." |
*
* @param {Onboarding_Escrow_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_warning: ((inputs?: Onboarding_Escrow_WarningInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_WarningInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_WarningInputs = {};
