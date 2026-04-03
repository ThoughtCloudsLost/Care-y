/**
* | output |
* | --- |
* | "Security Summary" |
*
* @param {Dashboard_Exposure_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_exposure_title: ((inputs?: Dashboard_Exposure_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Exposure_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Exposure_TitleInputs = {};
