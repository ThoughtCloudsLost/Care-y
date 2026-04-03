/**
* | output |
* | --- |
* | "Checking your protection status..." |
*
* @param {Dashboard_Exposure_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_exposure_subtitle: ((inputs?: Dashboard_Exposure_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Exposure_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Exposure_SubtitleInputs = {};
