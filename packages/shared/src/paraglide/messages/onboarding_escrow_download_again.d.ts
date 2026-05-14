/**
* | output |
* | --- |
* | "Download Again" |
*
* @param {Onboarding_Escrow_Download_AgainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download_again: ((inputs?: Onboarding_Escrow_Download_AgainInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Download_AgainInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Download_AgainInputs = {};
