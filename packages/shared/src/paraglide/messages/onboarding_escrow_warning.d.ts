/**
* | output |
* | --- |
* | "This file is your emergency recovery key. If every admin loses access to their account, this is the only way to recover your organization's data. Store it so..." |
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
