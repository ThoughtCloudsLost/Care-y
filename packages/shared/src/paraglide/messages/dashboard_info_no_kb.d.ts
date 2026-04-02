/**
* | output |
* | --- |
* | "No recent articles" |
*
* @param {Dashboard_Info_No_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_no_kb: ((inputs?: Dashboard_Info_No_KbInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Info_No_KbInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Info_No_KbInputs = {};
