/**
* | output |
* | --- |
* | "KB Updates" |
*
* @param {Dashboard_Info_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_kb: ((inputs?: Dashboard_Info_KbInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Info_KbInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Info_KbInputs = {};
