/**
* | output |
* | --- |
* | "The previous escrow file is still valid. If you proceed, securely delete the old copy to minimize exposure of your backup key." |
*
* @param {Onboarding_Escrow_Download_Again_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_download_again_body: ((inputs?: Onboarding_Escrow_Download_Again_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Escrow_Download_Again_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Escrow_Download_Again_BodyInputs = {};
