/**
* | output |
* | --- |
* | "Download Escrow File" |
*
* @param {Onboarding_Escrow_DownloadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download: ((inputs?: Onboarding_Escrow_DownloadInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_DownloadInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_DownloadInputs = {};
