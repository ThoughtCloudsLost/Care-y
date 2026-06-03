/**
* | output |
* | --- |
* | "Escrow export requires a secure connection. Please access this page over HTTPS." |
*
* @param {Onboarding_Escrow_Https_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_https_warning: ((inputs?: Onboarding_Escrow_Https_WarningInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Https_WarningInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Https_WarningInputs = {};
