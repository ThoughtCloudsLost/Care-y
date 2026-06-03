/**
* | output |
* | --- |
* | "Generate a new escrow file?" |
*
* @param {Onboarding_Escrow_Download_Again_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download_again_title: ((inputs?: Onboarding_Escrow_Download_Again_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Download_Again_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Download_Again_TitleInputs = {};
