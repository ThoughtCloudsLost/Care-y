/**
* | output |
* | --- |
* | "Download Again" |
*
* @param {Onboarding_Escrow_Download_AgainInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download_again: ((inputs?: Onboarding_Escrow_Download_AgainInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Download_AgainInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Download_AgainInputs = {};
