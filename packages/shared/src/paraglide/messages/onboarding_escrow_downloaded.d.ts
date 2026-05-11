/**
* | output |
* | --- |
* | "Escrow file downloaded. Store it safely." |
*
* @param {Onboarding_Escrow_DownloadedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_downloaded: ((inputs?: Onboarding_Escrow_DownloadedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_DownloadedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_DownloadedInputs = {};
